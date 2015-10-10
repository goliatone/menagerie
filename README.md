# menagerie
Manage things... all the things. WeeThings!

### TODO:
* Replace `autoPK`, use UUID as main id instead.
* CSV import
* CSV export
* Job to handle CSV import
* Print QR codes
* Add support for multiple identifiers:
    * Barcode
    * QR code

<!--
http://stackoverflow.com/questions/17929307/how-to-serve-a-bootstrap-template-in-sails-0-9
http://stackoverflow.com/questions/25988329/integrate-twitter-bootstrap-with-sails-js-v0-10
https://github.com/cgmartin/sailsjs-angularjs-bootstrap-example/tree/master/views

http://stackoverflow.com/questions/30671160/swagger-sails-js
-->




```js
var pojo = {name:'Sockete 3', description: 'Sockete instance', status:'offline', type:1, location:1}
io.socket.post('/device', pojo, function(data, jwres){
    console.log(arguments)
});
```

```js
io.socket.get('/device/1', function(data, jwres){
    console.log(arguments)
});
```
