//import for unsplash API
const fetch = require("node-fetch");
const { createApi } = require("unsplash-js");
const { photo } = require("../models");

// Load Unsplash API
const unsplash = createApi({
	accessKey: process.env.UNSPLASH_ACCESS_KEY,
	headers: { "Accept-Version": "v1" },
	fetch: fetch,
});

module.exports.search = async (options) => {
    try {
        return await unsplash.search.getPhotos(options);
    } catch (error) {
        //console.log(error);
        return null;
    }
	
};

module.exports.browse = async (page = 1, limit = 10) => {
    try {
        return await unsplash.photos.list({ page: page, perPage: limit });
    } catch (error) {
        //console.log(error);
        return null;
    }
	
};

module.exports.getPhoto = async (id) => {
    try {
        return await unsplash.photos.get({ photoId: id });
    } catch (error) {
        //console.log(error);
        return null;
    }
	
};

module.exports.savePhotoToLocal = async (data) => {
    try {
        let newData = {
            photo_id: data.id,
            width: data.width,
            height: data.height,
            description: data.description,
            image_links: data.urls,
            categories: data.categories,
            likes: data.likes,
            source_user: data.user,
            avg_rating: 0,
            count_review: 0,
            source_created_at: new Date(data.created_at),
            source_updated_at: new Date(data.updated_at),
            source_type : 'unsplash',
        };


    
        let insertedData = await photo.create(newData);
        if (insertedData) {
            return insertedData.id;
        } else return false;
    } catch (error) {
        //console.log(error);
        return null;
    }
	
};
