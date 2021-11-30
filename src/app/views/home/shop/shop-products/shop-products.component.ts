import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { Category, Product } from 'src/models';
import { Company } from 'src/models/company.model';
import { Promotion } from 'src/models/promotion.model';
import { HomeShopService } from 'src/services/home-shop.service';
import { ProductService } from 'src/services/product.service';
import { UxService } from 'src/services/ux.service';

@Component({
  selector: 'app-shop-products',
  templateUrl: './shop-products.component.html',
  styleUrls: ['./shop-products.component.scss']
})
export class ShopProductsComponent implements OnInit {
  selectedCategory: Category;
  @Input() company: Company;
  promotions: Promotion[];
  @Output() selectCategoryEvent: EventEmitter<Category> = new EventEmitter<Category>();
  @Output() viewProductEvent: EventEmitter<Product> = new EventEmitter<Product>();
  allProducts: Product[];
  products: Product[];
  constructor(
    private homeShopService: HomeShopService,
    private productService: ProductService,
    private uxService: UxService,
    private router: Router,
  ) { }

  ngOnInit() {

    if (this.company) {
      this.promotions = this.company.Promotions;
      this.homeShopService.productShopListObservable.subscribe(data => {
        if (data && data.length) {
          this.allProducts = data.filter(x => x.CompanyId === this.company.CompanyId);
          this.products = this.allProducts;
        }
      });
    }

  }
  viewMore(product: Product) {
    if (product) {
      this.homeShopService.updateProductState(product);
      this.uxService.keepNavHistory(null);
      this.router.navigate(['shop/product', product.ProductSlug])
    }
  }
  selectCategory(category: Category) {
    if (category && category.IsShop) {
      this.homeShopService.updateCategoryState(category);
      this.router.navigate([`shop/collections/${category.Name}`])
    }

  }
  gotoShop(e) { }
}
