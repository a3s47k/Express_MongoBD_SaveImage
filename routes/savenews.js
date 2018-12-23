var express = require('express');
var bcrypt = require("bcrypt")
var crypto = require("crypto")
var router = express.Router();
var multer = require('multer');
var News = require("../models/news.model")

var Storage = multer.diskStorage({
	destination: function (req, file, callback) {
		callback(null, "./public/uploads/news");
	},
	filename: function (req, file, callback) {
		let type = 'jpg'
		if (file.mimetype === 'image/png') {
			type = 'png'
		} else if (file.mimetype === 'image/jpeg') {
			type = 'jpeg'
		} else {
			type = 'jpg'
		}
		callback(null, crypto.createHash('md5').update(Date.now() + "_" + removeVietnam(file.originalname.substring(0, 10))).digest('hex') + '.' + type);
	}
});
var upload = multer({
	storage: Storage
}).any(
);


router.post('/', function (req, res, next) {

	upload(req, res, function (err) {
		if (err) {
			return res.end("error");
		} else {
			let {
				Title,
				Desc
			} = req.body;

			let friendly = removeVietnam(Title)
			let tmpImg ='/uploads/news/' + req.files[0].filename
			,tmpImg2 ='/uploads/news/' + req.files[1].filename
			console.log(tmpImg)
			console.log(tmpImg2)

			let hash = crypto.createHash('sha256').update(friendly).digest('hex');
			let hashKey = hash.slice(0, 10) + '-' + crypto.randomBytes(8).toString('hex') + '-' + hash.slice(10, 20) + '-' + hash.slice(hash.length - 6, hash.length) + '-' + crypto.randomBytes(5).toString('hex')


			var myData = new News({
				key: hashKey,
				title: Title,
				desc: Desc,
				img: [tmpImg,tmpImg2]
				
			});
			myData.save().then(item => {
					res.redirect("/news")
					// res.send(item); // Chỉ bật lên khi viết APIs
				})
				.catch(err => {
					next(err);
					res.status(400).send("unable to save to database");
				});
		}
	})

})
function removeVietnam(s) {
	var r = s.toLowerCase().replace(/\s+/g, '-');
	non_asciis = {
		'-': '[`~!@#$%^&*()_|+=?;:",.<>/]',
		'a': '[ảàạảãàáâãäåắặẳằẵấầẩẫậâă]',
		'ae': 'æ',
		'c': 'ç',
		'e': '[èéẹẽẻềệếểễê]',
		'd': '[đ]',
		'i': '[ìíîïị]',
		'n': 'ñ',
		'o': '[òóôõöộồốổỗơởợỡờớôơ]',
		'oe': 'œ',
		'u': '[ùúûűüủụưửựứừữư]',
		'y': '[ýỳỷỵỹ]'
	};
	for (i in non_asciis) {
		r = r.replace(new RegExp(non_asciis[i], 'gi'), i);
	}
	r = r.replace(/[^\w\s]/gi, '-')
	return r
};


module.exports = router;
