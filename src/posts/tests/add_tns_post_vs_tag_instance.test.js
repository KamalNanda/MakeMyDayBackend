

import assert from 'assert'   
import { create_instances_in_tns_post_vs_tag_table } from '../utilities/create_instances_in_tns_post_vs_tag_table.js';
// import {dataArr, dataArrSecond, dataArrThird} from './datasets.js'


describe('Check create_instances_in_tns_post_vs_tag_table function expected outcome', function () { 
    it('it should return 2 when ["f4571bc0-f2d5-11ef-aa95-932b1e83d8cc","f45769e0-f2d5-11ef-aa95-932b1e83d8cc"] is passed', async function () { 
        let result = await create_instances_in_tns_post_vs_tag_table(['f45769e0-f2d5-11ef-aa95-932b1e83d8cc', 'f4571bc0-f2d5-11ef-aa95-932b1e83d8cc'],'fd98a550-f2d5-11ef-b655-212c7c81ee1b','f4571bc0-f2d5-11ef-aa95-932b1e83d8cc')
        assert.equal(result.length, 2)
    });  
});