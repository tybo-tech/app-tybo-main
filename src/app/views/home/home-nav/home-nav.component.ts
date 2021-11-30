import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { Category, NavigationModel, Order, Product, User } from 'src/models';
import { SearchResultModel } from 'src/models/search.model';
import { HomeNavUx } from 'src/models/UxModel.model';
import { AccountService, OrderService, ProductService } from 'src/services';
import { HomeShopService } from 'src/services/home-shop.service';
import { NavigationService } from 'src/services/navigation.service';
import { UxService } from 'src/services/ux.service';
import { ORDER_TYPE_SALES } from 'src/shared/constants';

@Component({
  selector: 'app-home-nav',
  templateUrl: './home-nav.component.html',
  styleUrls: ['./home-nav.component.scss']
})
export class HomeNavComponent implements OnInit {
  user: User;
  logoUx: HomeNavUx;
  showSearch: boolean;
  carttItems = 0;
  navItems = [];
  order: Order;
  products: Product[];
  allProducts: Product[];
  tertiaryCategories: Category[];
  parentCatergories: Category[];
  catergories: Category[];
  searchString: string
  searchResults: SearchResultModel[] = [];

  constructor(
    private navigationService: NavigationService,
    private accountService: AccountService,
    private orderService: OrderService,
    private homeShopService: HomeShopService,
    private productService: ProductService,
    private router: Router,
    private uxService: UxService,

  ) {

  }

  ngOnInit() {
    this.user = this.accountService.currentUserValue;
    this.accountService.user.subscribe(user => {
      this.user = user;
    });
    this.uxService.navBarLogoObservable.subscribe(data => {
      if (data) {
        this.logoUx = data;
      } else {
        this.logoUx = {
          Name: '',
          LogoUrl: `assets/images/common/tybo.png`
        }
      }
    });

    this.orderService.OrderObservable.subscribe(data => {
      this.order = data;
      if (this.order) {
        this.carttItems = this.order.Orderproducts && this.order.Orderproducts.length || 0;
      }
    });
    this.loadAllProducts();
  }
  loadAllProducts() {
    this.productService.getAllActiveProductsSync().subscribe(data => {
      if (data) {
        this.products = data
        this.allProducts = data;
        this.loadCategories(this.allProducts);

        // this.tab(this.parentCatergories[0]);
        // this.homeShopService.updateProductShopListState(this.allProducts);
      }
    });
  }

  showAllProducts() {
    this.goto('');
    const cat = this.homeShopService.getCurrentParentCategoryValue;
    if (cat) {
      this.tab(cat);
    } else {
      this.tab(this.parentCatergories[0]);
    }
  }
  goto(event) {
    this.router.navigate([event]);
  }
  toggle() {
    this.uxService.updateShowSideNavState(true);
  }
  tab(category: Category) {
    if (category) {
      this.parentCatergories.map(x => x.IsSelected = false);
      category.IsSelected = true;
      const products = this.allProducts.filter(x => x.ParentCategoryGuid === category.CategoryId);
      console.log(products);
      this.homeShopService.updateProductShopListState(this.allProducts);
      this.homeShopService.updateParentCategoryState(category);
    }

  }


  loadCategories(products: Product[]) {
    this.catergories = [];
    this.parentCatergories = [];
    this.tertiaryCategories = [];

    products.forEach(product => {
      if (!this.catergories.find(x => x && x.CategoryId === product.CategoryGuid)) {
        if (product.Category) {
          this.catergories.push(product.Category);
        }
      }
      if (!this.parentCatergories.find(x => x && x.CategoryId === product.ParentCategoryGuid)) {
        if (product.ParentCategory) {
          this.parentCatergories.push(product.ParentCategory);
        }
      }
      if (!this.tertiaryCategories.find(x => x && x.CategoryId === product.TertiaryCategoryGuid)) {
        if (product.TertiaryCategory) {
          this.tertiaryCategories.push(product.TertiaryCategory);
        }
      }
    });



    this.products.map(x => x.Category = null);
    this.products.map(x => x.ParentCategory = null);
    this.products.map(x => x.TertiaryCategory = null);
    const cat = this.homeShopService.getCurrentParentCategoryValue;
    if (cat) {
      this.tab(cat);
    } else {
      this.tab(this.parentCatergories[0]);
    }

  }
  childCategoryselected(child) {
    console.log(child);

  }

  search() {
    this.searchResults = [];
    if (this.allProducts && this.searchString) {
      this.searchString = this.searchString.toLocaleLowerCase();
      const matchingProducts = this.allProducts.filter(x => {
        if (x.Name && x.Name.toLocaleLowerCase().includes(this.searchString)) {
          return x;
        }
      });
      matchingProducts.forEach(x => {

        this.searchResults.push(
          {
            Name: x.Name,
            RegularPrice: x.RegularPrice,
            Icon: x.FeaturedImageUrl,
            Object: x,
            Type: 'product'
          }
        );
      })
    }

  }


  openSearchResult(item: SearchResultModel) {
    if (!item) {
      return;
    }
    this.showSearch = false;

    if (item.Type === 'product') {
      this.viewMore(item.Object);
      this.searchString = undefined;
    }
  }

  viewMore(model: Product) {
    const order = this.orderService.currentOrderValue;
    if (!order) {
      this.orderService.updateOrderState({
        OrdersId: '',
        OrderNo: 'Shop',
        CompanyId: model.CompanyId,
        CustomerId: '',
        AddressId: '',
        Notes: '',
        OrderType: ORDER_TYPE_SALES,
        Total: 0,
        Paid: 0,
        Due: 0,
        InvoiceDate: new Date(),
        DueDate: '',
        CreateUserId: 'shop',
        ModifyUserId: 'shop',
        Status: 'Not paid',
        StatusId: 1,
        Orderproducts: []
      });
    }
    if (model) {
      this.homeShopService.updateProductState(model);
      this.homeShopService.updatePageMovesIntroTrueAndScrollOpen();
      // this.router.navigate([model.Company && model.Company.Slug || model.CompanyId]);
      this.router.navigate(['shop/product', model.ProductSlug || model.ProductId])

    }
  }
}
