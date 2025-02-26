// test/app.test.js
import request from 'supertest';
import { expect } from 'chai';   
import { app } from '../../../index.js';

describe('Add Post', () => {
    it('should return 200 if post is added successfully in db', (done) => {
        request(app)
            .post('/mmd/v1/posts/create-post')
            .send({
                type : 'video' , 
                title : 'Happy Video'  ,
                description : 'This is a description',
                tags : ['meme', 'funny']  ,
                media_id : 'f6f19735-553c-4e2a-9c07-6c65df9bd47c',
                external_url: 'kamal',
            })
            .expect(200)
            .end((err, res) => {
                if (err) return done(err);
                expect(res.body).to.have.property('status', true);
                done();
            });
    });
}) 