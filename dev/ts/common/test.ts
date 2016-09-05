import { Http } from '@angular/http';


export class ModuleTest {
    public constructor(public name:string) {
        
    }
}
export class HttpUser {
    public http:Http
    public constructor() {
        this.http = new Http(null,null)
    }
    public Post() {
        this.http.post("//www.baidu.com",{}).subscribe((resp)=>{
            console.log(resp)
        })
    }
}