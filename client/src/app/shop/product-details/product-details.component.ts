import { Component, OnInit } from '@angular/core';
import { Product } from 'src/app/shared/models/product';
import { ShopService } from '../shop.service';
import { ActivatedRoute } from '@angular/router';
import { BreadcrumbService } from 'xng-breadcrumb';
import { BasketService } from 'src/app/basket/basket.service';

@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.scss']
})
export class ProductDetailsComponent implements OnInit{
  product?: Product;

  constructor(public basketService: BasketService, private shopService: ShopService, private activatedRoute: ActivatedRoute, 
    private bcService: BreadcrumbService) {
      this.bcService.set('@productDetails', ' ')
    }

  ngOnInit(): void {
    this.loadProduct();
  }

  loadProduct() {
    const id = this.activatedRoute.snapshot.paramMap.get('id');
   if (id) this.shopService.getProduct(+id).subscribe({
    next: product => {
      this.product = product;
      this.bcService.set('@productDetails', product.name)
    },
    error: error => console.log(error)
   })
  }

  incrementQuantity() {
    if (this.product) {
      this.basketService.addItemToBasket(this.product);
    }
  }

  removeItem(id: number, quantity: number) {
    this.basketService.removeItemFromBasket(id, quantity);
  }

  getQuantityInBasket() {
    const basket = this.basketService.getCurrentBasketValue();
    if (!basket) {
      return 0;
    }

    const basketItem = basket.items.find(x => x.id === this.product!.id);

    if (!basketItem) {
      return 0;
    }
    return basketItem.quantity;
  }

}
