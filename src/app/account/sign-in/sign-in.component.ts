import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Location } from '@angular/common';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { LocationStrategy } from '@angular/common';
import { AccountService } from 'src/services/account.service';
import { TokenModel } from 'src/models/account.model';
import { ADMIN, CUSTOMER, IMAGE_WARN, SUPER } from 'src/shared/constants';
import { OrderService } from 'src/services/order.service';
import { Email, Order } from 'src/models';
import { ModalModel } from 'src/models/modal.model';
import { UxService } from 'src/services/ux.service';
import { NavHistoryUX } from 'src/models/UxModel.model';
import { EmailService } from 'src/services';


@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss']
})
export class SignInComponent implements OnInit {
  @Output() navAction: EventEmitter<boolean> = new EventEmitter<boolean>();
  email: string;
  password: string;

  showMobileNav;
  error: string;
  loading$: Observable<boolean>;
  
  hidePassword = true;
  shopSecondaryColor;
  shopPrimaryColor;
  logoUrl;
  token: string;
  myemail: string;
  showLoader: boolean = false;
  order: Order;
  modalModel: ModalModel = {
    heading: undefined,
    body: [],
    ctaLabel: 'Go to login',
    routeTo: 'home/sign-in',
    img: undefined
  };
  navHistory: NavHistoryUX;
  showSuccess: boolean;
  showAdd;

  constructor(
    private routeTo: Router,
    private accountService: AccountService,
    private location: LocationStrategy,
    private orderService: OrderService,
    private uxService: UxService,
    private emailService: EmailService,
    private _location: Location,


  ) {
  }


  ngOnInit() {
    this.order = this.orderService.currentOrderValue;
    if (this.order) {
      if (this.order.CustomerId === 'pending') {

        this.modalModel.heading = ` `
        this.modalModel.img = IMAGE_WARN;
        this.modalModel.body.push('Please login to checkout.')
        this.order.CustomerId = 'checked'
        this.orderService.updateOrderState(this.order);
      }

    }

    this.loading$ = this.accountService.loading;
    const baseUrlMain: string = (this.location as any)._platformLocation.location.href;
    this.token = baseUrlMain.substring(baseUrlMain.indexOf('=') + 1);
    // this.activateUser();
    this.uxService.uxNavHistoryObservable.subscribe(data => {
      this.navHistory = data;
    })
  }

  back() {
    if (this.navHistory && this.navHistory.BackToAfterLogin) {
      this.routeTo.navigate([this.navHistory.BackToAfterLogin]);
    } else {
      this.routeTo.navigate(['']);
    }
  }
  // togo
  activateUser() {
    const tokenModel: TokenModel = { Token: this.token };
    if (tokenModel.Token) {
      this.accountService.activateUser(tokenModel)
        .subscribe(data => {
          if (data > 0) {
            alert('Account successfully activated, Please login');
            return;
          }
        });
    }
  }


  Login() {
    this.showLoader = true;
    this.accountService.login({ email: this.email, password: this.password }).subscribe(user => {
      if (user && user.UserId) {
        this.error = '';
        this.accountService.updateUserState(user);
        if (user && user.UserType === CUSTOMER && this.navHistory && this.navHistory.BackToAfterLogin) {
          this.routeTo.navigate([this.navHistory.BackToAfterLogin]);
        }
        if (user.UserType === ADMIN) {
          this.routeTo.navigate(['admin/dashboard']);
        }
        if (user.UserType === SUPER) {
          this.routeTo.navigate(['admin/dashboard']);
        }
        if (user.UserType === CUSTOMER) {
          if (this.order && this.order.CustomerId === 'checked') {
            this.order.CustomerId = user.UserId;
            this.order.Customer = user;
            this.orderService.updateOrderState(this.order);
            this.routeTo.navigate(['shop/checkout']);
          } else {
            this.routeTo.navigate(['']);
          }
        }
        this.showLoader = false;
      }
      else {
        let err: any = user;
        this.error = err + '. , Or contact us if you did not get the mail.' || 'your email or password is incorrect';
        this.showLoader = false;
      }
    });
  }



  sendLink() {
    this.error = undefined;
    this.accountService.generateToken({ Email: this.myemail }).subscribe(data => {
      if (data.UserToken) {
        const link = this.accountService.generateForgotPasswordReturnLink(data.UserToken);
        this.sendEmailToCustomer(this.myemail, data.Name, link);
      } else {
        this.error = `Account with <b>${this.myemail} </b> was not found, please try agian`;
      }
    });
  }



  sendEmailToCustomer(emailTo: string, userName: string, link: string) {

    const data = `
    <div>
    <h1>
    Hi  ${userName}  Let's reset that password.
    </h1>

    <p>
      Don't worry. It happens to everyone. To reset your password, click the button below.
    </p>
    <a href="${link}">
      <button  
      style="background: #F3CF3D; color: #000; padding: 1em; width: fit-content;border: none;border-radius: .5em;">
      Choose new password</button>
    </a>

    <br><br>

    <p>
      Cheers, <br>
      Tybo Solutions Team
    </p>
    </div>
    `;
    const email = emailTo;
    const emailToSend: Email = {
      Email: email,
      Subject: 'Password reset link.',
      Message: `${data}`,
      UserFullName: userName,
    };
    this.emailService.sendGeneralTextEmail(emailToSend)
      .subscribe(response => {
        this.showLoader = false;
        this.showAdd = false;
        this.showSuccess = true;
        if (response > 0) {

        }
      });
  }

}



