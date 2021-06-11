//import for unsplash API
const fetch = require("node-fetch");
const { createApi } = require("unsplash-js");

// Load Unsplash API
const unsplash = createApi({
	accessKey: process.env.UNSPLASH_ACCESS_KEY,
	headers: { "Accept-Version": "v1" },
	fetch: fetch,
});

module.exports.search = async (options) => {
	return await unsplash.search.getPhotos(options);
};

module.exports.searchUsers = async (options) => {
	return await unsplash.search.getUsers(options);
};
