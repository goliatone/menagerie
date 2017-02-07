'use strict';

/*
 * UUIDs we get for user or locations do not
 * follow version 1-5 of RFC4122 which is the
 * current standard. That makes most validators
 * useless :)
 *
 *  ```js
 *  ['a4fc0200-3ddb-0132-028d-06cd6b4b91ee',
 *  '97326a20-b7af-0131-8f88-6266835b7202',
 *  '5788b080-5583-0133-71a0-5ea7e33c0b28',
 *  '37b30a00-d5e5-0130-9ac3-1641160c5fb3',
 *  '78a7be90-d153-0130-f89f-0ea1f58f43d9',
 *  '21abf987-1328-41cf-a45c-cbc5829cacfd',
 *  'a8a43c70-0244-0133-e369-22f3a868126a',
 *  '90ec82c0-b1f4-0131-aaba-327a344fe8c3']
 *  ```
 */
var UUID_REGEX = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}|[0-9a-f]{32}/i;
function  isUUID(str){
    if(!str || typeof str !== 'string') return false;
    return !!str.match(UUID_REGEX);
}


module.exports = isUUID;
