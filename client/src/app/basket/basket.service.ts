import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Basket, BasketItem, BasketTotals } from '../shared/models/basket';
import { HttpClient } from '@angular/common/http';
import { Product } from '../shared/models/product';

@Injectable({
  providedIn: 'root'
})
export class BasketService {
  baseUrl = environment.apiUrl;
  private _basketSource = new BehaviorSubject<Basket | null>(null);
  basketSource$ = this._basketSource.asObservable();
  private _basketTotalSource = new BehaviorSubject<BasketTotals | null>(null);
  basketTotalSource$ = this._basketTotalSource.asObservable();

  constructor(private http:HttpClient) { }

  getBasket(id: string) {
    return this.http.get<Basket>(this.baseUrl + 'basket?id=' + id).subscribe({
      next: basket => {
        this._basketSource.next(basket);
        this._calculateTotals();
      }
    })
  }

  setBasket(basket: Basket) {
    return this.http.post<Basket>(this.baseUrl + 'basket', basket).subscribe({
      next: basket => {
        this._basketSource.next(basket);
        this._calculateTotals();
      }
    })
  }

  getCurrentBasketValue() {
    return this._basketSource.value;
  }

  addItemToBasket(item: Product | BasketItem, quantity = 1) {
    if (this._isProduct(item)) {
      item = this._mapProductItemToBasketItem(item)
    }
    const basket = this.getCurrentBasketValue() ?? this._createBasket();
    basket.items = this._addOrUpdateItems(basket.items, item, quantity);
    this.setBasket(basket);
  }

  removeItemFromBasket(id: number, quantity = 1) {
    const basket = this.getCurrentBasketValue();
    if (!basket) {
      return;
    }
    const item = basket.items.find(x => x.id === id);
    if (item) {
      item.quantity -= quantity;
      if (item.quantity === 0) {
        basket.items = basket.items.filter(x => x.id !== id);
      }
      if (basket.items.length > 0) {
        this.setBasket(basket);
      } else {
        this.deleteBasket(basket);
      }
    }
  }

  deleteBasket(basket: Basket) {
    return this.http.delete(this.baseUrl + 'basket?id=' + basket.id).subscribe({
      next: () => {
        this._basketSource.next(null);
        this._basketTotalSource.next(null);
        localStorage.removeItem('basket_id');
      }
    })
  }

  private _addOrUpdateItems(items: BasketItem[], itemToAdd: BasketItem, quantity: number): BasketItem[] {
    const item = items.find(x => x.id === itemToAdd.id);
    if (item) {
      item.quantity += quantity;
    } else {
      itemToAdd.quantity = quantity;
      items.push(itemToAdd);
    }
    return items;
  }
  
  private _createBasket(): Basket {
    const basket = new Basket();
    localStorage.setItem('basket_id', basket.id);
    return basket;
  }

  private _mapProductItemToBasketItem(item:Product): BasketItem {
    return {
      id: item.id,
      productName: item.name,
      price: item.price,
      quantity: 0,
      pictureUrl: item.pictureUrl,
      brand: item.productBrand,
      type: item.productType
    }
  }

  private _calculateTotals() {
    const basket = this.getCurrentBasketValue();
    if (!basket) {
      return;
    }
    const shipping = 0;
    const subtotal = basket.items.reduce((a, b) => (b.price * b.quantity) + a, 0);
    const total = subtotal + shipping;
    this._basketTotalSource.next({shipping, total, subtotal});
  }

  private _isProduct(item: Product | BasketItem): item is Product {
    return (item as Product).productBrand !== undefined;
  }
}
