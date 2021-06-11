let Flickr = require("flickr-sdk");
let flickr = new Flickr(process.env.FLICKR_API_KEY);

module.exports.search = async (opt) => {
	try {
		let dataResult = await flickr.photos.search(opt);

		//reformat the data to match unsplash format
		dataResult.body.photos.total_pages = dataResult.body.photos.pages;
		delete dataResult.body.photos.pages;

		let photoRequest = dataResult.body.photos.photo.map(async (el) => {
			let detail = await flickr.photos.getInfo({ photo_id: el.id });
			let returnData = Object.assign(el, detail);
			return returnData;
		});

		let photoCont = await Promise.all(photoRequest);
		let photoData = photoCont.map((el) => el.body.photo);
		delete dataResult.body.photos.photo;
		dataResult.body.photos.results = photoData;

		return dataResult;
	} catch (error) {
		console.log(error);
		return null;
	}
};

module.exports.browse = async (page = 1, limit = 10) => {
	try {
		let dataResult = await flickr.photos.getRecent({
			page: page,
			per_page: limit,
		});

		//reformat the data to match unsplash format
		dataResult.body.photos.total_pages = dataResult.body.photos.pages;
		delete dataResult.body.photos.pages;

		let photoRequest = dataResult.body.photos.photo.map(async (el) => {
			let detail = await flickr.photos.getInfo({ photo_id: el.id });
			let returnData = Object.assign(el, detail);
			return returnData;
		});

		let photoCont = await Promise.all(photoRequest);
		let photoData = photoCont.map((el) => el.body.photo);
		delete dataResult.body.photos.photo;
		dataResult.body.photos.results = photoData;

		return dataResult;
	} catch (error) {
		console.log(error);
		return null;
	}
};

module.exports.getPhoto = async (id) => {
	try {
		let detail = (await flickr.photos.getInfo({ photo_id: id })).body.photo;
		let size = (await flickr.photos.getSizes({ photo_id: id })).body.sizes.size;
		let urls = {};
		size.forEach((el) => {
			if (el.label == "Thumbnail") {
				urls.thumb = el.source;
			} else if (el.label == "Original") {
                urls.full = el.source;
				urls.raw = el.source;
			}
		});
		console.log(urls);
		let dataResult = Object.assign(detail, { urls: urls });
		return dataResult;
	} catch (error) {
		console.log(error);
		return null;
	}
};

module.exports.savePhotoToLocal = async (data) => {
	try {
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
	} catch (error) {
		console.log(error);
		return null;
	}
};
