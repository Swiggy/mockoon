// import { RouteType } from "../app/types/route.type"
import {Pipe, PipeTransform} from '@angular/core';
@Pipe({
  name: 'myFilter',
  pure: false
})
export class MyFilterPipe implements PipeTransform {
    transform(items: any[], str : string): any {
        if( str == undefined || str.length<2)
            return items;
        return items.filter(element => {
          return element.endpoint.includes(str);
        });
    }
}