

import assert from 'assert'  
import { check_tag_existence_and_insert } from '../utilities/check_tag_existence_and_insert.js';
// import {dataArr, dataArrSecond, dataArrThird} from './datasets.js'


describe('Check tag existence and insert function expected outcome', function () { 
    it('it should return 2 when ["funny","meme"] is passed', async function () { 
        let result = await check_tag_existence_and_insert(['funny', 'meme'],'f4571bc0-f2d5-11ef-aa95-932b1e83d8cc')
        assert.equal(result.length, 2)
    }); 
    it('it should return 3 when ["funny","bitcoin", "dog"] is passed', async function () { 
        let result = await check_tag_existence_and_insert(["funny","bitcoin", "dog"],'f4571bc0-f2d5-11ef-aa95-932b1e83d8cc')
        assert.equal(result.length, 3)
    }); 
});