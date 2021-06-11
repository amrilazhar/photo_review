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
	return await unsplash.search.getPhotos(options);
};

module.exports.browse = async (page = 1, limit = 10) => {
	return await unsplash.photos.list({ page: page, perPage: limit });
};

module.exports.getPhoto = async (id) => {
	return await unsplash.photos.get({ photoId: id });
};

module.exports.savePhotoToLocal = async (data) => {
	let newData = {
		unsplash_id: data.id,
		flickr_id: null,
		width: data.width,
		height: data.height,
		description: data.description,
		image_links: data.urls,
		categories: data.categories,
		likes: data.likes,
		unsplash_user: data.user,
		avg_rating: 0,
		count_review: 0,
		source_created_at: data.created_at,
		source_updated_at: data.updated_at,
	};

	let insertedData = await photo.create(newData);
	if (insertedData) {
		return insertedData.id;
	} else return false;
};
