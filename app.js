//Server
const server							=	require('express')();
const https								= require("https");
const http								=	require('http').Server(server);
const fs 									=	require('fs');
const express							=	require('express');
const bodyParser					=	require('body-parser');    
const session							=	require('express-session');
const nodemailer					=	require('nodemailer');
const dotenv 							=	require('dotenv');
const cookieParser				=	require('cookie-parser');
const crypto							=	require('node:crypto');
const {MongoClient}				=	require('mongodb');
const io = require('socket.io')(http, {
  pingTimeout: 3600000,   // 30 seconds instead of default ~5s
  pingInterval: 10000   // keep-alive pings every 10s
});
const aws									= require('aws-sdk');
const multer							= require('multer');
const multerS3						= require('multer-s3-transform');
const sharp 							= require('sharp');
const pdfParse						=	require('pdf-parse');
const {Worker,SHARE_ENV}	=	require('worker_threads');
const schedule 						= require('node-schedule');
const request 						=	require('request');
const axios								=	require('axios');
const qs									=	require('qs');
dotenv.config();

var ntsHeader = {
    'accept': 'text/plain',
    'nts-application': 'nts-rest-api',
    'Content-Type': 'application/json'
};

var ntsOptions = {
    url: 'https://app.nts-international.net/NTSSecurity/login',
    method: 'POST',
    headers: ntsHeader,
    auth: {username:process.env.ntsusername,password:process.env.ntspassword}
};

var websiteHeader = {
    'accept': 'text/plain',
    'Content-Type': 'application/json'
};

var websiteOptions = {
    url: 'https://poslovigrada.rs/nalog',
    method: 'POST',
    headers: websiteHeader
};

const data = qs.stringify({
  username: process.env.telematicskey,  // Replace with your actual key
  password: process.env.telematicspass, // Replace with your actual secret key
  grant_type: 'password'
});

var baseUrl = "https://api.gpsiot.net";
var config = {
	method: 'post',
	url: baseUrl+'/token', // Replace with your actual URL
	headers: {
		'Content-Type': 'application/x-www-form-urlencoded'
	},
	data: data
};


var token;
var telematicsId = process.env.telematicsid;

/*request(websiteOptions, (error,response,body)=>{
	if(error){
		console.log(error)
	}else{
		//console.log(response.body);
		console.log("-------------------------");
		var json = response.body;
		//console.log(json.results[0].geometry.location)
	}
})*/


/*var geoCodeHeader = {
    'accept': 'text/plain',
    'Content-Type': 'application/json'
};

var geoCodeOptions = {
    url: 'https://maps.googleapis.com/maps/api/geocode/json?address='+encodeURIComponent("Vidikovački Venac 90")+',Beograd&key='+process.env.googlegeocoding,
    method: 'GET',
    headers: geoCodeHeader
};

request(geoCodeOptions, (error,response,body)=>{
	if(error){
		console.log(error)
	}else{
		//console.log(response.body);
		console.log("-------------------------");
		var json = JSON.parse(response.body);
		//console.log(json.results[0].geometry.location)
	}
})*/


/*request(ntsOptions, (error,response,body)=>{
	if(error){
		console.log(error)
	}else{
		console.log("request recevied");
		//console.log(response.headers['set-cookie']);
		var cookie = response.headers['set-cookie'];
		var headers = {
			'accept': 'application/json',
	    'Cookie': cookie,
	    'Content-Type': 'application/json'
		}
		var options = {
		    url: 'https://app.nts-international.net/ntsapi/allvehicles',
		    method: 'GET',
		    headers: headers
		};
		console.log("Request2 sent");
		request(options, (error,response2,body2)=>{
			if(error){
				console.log(error)
			}else{
				console.log("request2 received");
				console.log(JSON.parse(response2.body));

			}
		});
	}
});*/

/*request(ntsOptions, (error,response,body)=>{
	if(error){
		console.log(error)
	}else{
		console.log("request recevied");
		//console.log(response.headers['set-cookie']);
		var cookie = response.headers['set-cookie'];
		var headers = {
			'accept': 'application/json',
	    'Cookie': cookie,
	    'Content-Type': 'application/json'
		}
		var options = {
		    url: 'https://app.nts-international.net/ntsapi/allvehicles',
		    method: 'GET',
		    headers: headers
		};
		console.log("Request2 sent");
		request(options, (error,response2,body2)=>{
			if(error){
				console.log(error)
			}else{
				console.log("request2 received");
				var array = JSON.parse(response2.body);
				var csvString = "Broj Tablice,Opis,ID\r\n";
				for(var i=0;i<array.length;i++){
					csvString += array[i].licenceplate+","+array[i].description+","+array[i].id+"\r\n"
				}
				fs.writeFileSync("./Vozila.csv",csvString,"utf8");	
			}
		});
	}
});*/

/*request(options, (error,response,body)=>{
	if(error){
		console.log(error)
	}else{
		console.log("request recevied");
		//console.log(response.headers['set-cookie']);
		var cookie = response.headers['set-cookie'];
		var headers = {
			'accept': 'application/json',
	    'Cookie': cookie,
	    'Content-Type': 'application/json'
		}
		var options = {
		    url: 'https://app.nts-international.net/ntsapi/stops?vehicle=44537&from=2024-04-18 00:00:00&to=2024-04-19 00:00:00&timzeone=UTC&version=2.3',
		    method: 'GET',
		    headers: headers
		};
		console.log("Request2 sent");
		request(options, (error,response2,body2)=>{
			if(error){
				console.log(error)
			}else{
				console.log("request2 received");
				console.log(JSON.parse(response2.body))
			}
		});
	}
});*/

/*request(options, (error,response,body)=>{
	if(error){
		console.log(error)
	}else{
		console.log("request recevied");
		//console.log(response.headers['set-cookie']);
		var cookie = response.headers['set-cookie'];
		var headers = {
			'accept': 'application/json',
	    'Cookie': cookie,
	    'Content-Type': 'application/json'
		}
		var options = {
		    url: 'http://app.nts-international.net/ntsapi/allvehiclestate?timezone=UTC&sensors=true&ioin=true',
		    method: 'GET',
		    headers: headers
		};
		console.log("Request2 sent");
		request(options, (error,response2,body2)=>{
			if(error){
				console.log(error)
			}else{
				console.log("request2 received");
				console.log(JSON.parse(response2.body))
			}
		});
	}
});*/

server.set('view engine','ejs');
var viewArray	=	[__dirname+'/views'];
var viewFolder	=	fs.readdirSync('views');
for(var i=0;i<viewFolder.length;i++){
	if(viewFolder[i].split(".").length==1){
		viewArray.push(__dirname+'/'+viewFolder[i])
	}
}
server.set('views', viewArray);
server.use(express.static(__dirname + '/public'));
server.use(bodyParser.json({limit:'50mb'}));  
server.use(bodyParser.urlencoded({ limit:'50mb',extended: true }));
server.use(cookieParser());
server.use(session({
	secret: process.env.sessionsecret,
    resave: true,
    saveUninitialized: true
}));
const mongourl	=	process.env.mongourl;
const client 	= 	new MongoClient(mongourl,{});


var transporter = nodemailer.createTransport({
	host: process.env.transporterhost,
	port: 465,
	secure: true,
	auth: {
		user: process.env.transporteruser,
		pass: process.env.transporterpass
	}
});

const spacesEndpointSlike = new aws.Endpoint("fra1.digitaloceanspaces.com/slike");
const s3Slike = new aws.S3({
  endpoint: spacesEndpointSlike,
  credentials: {
    accessKeyId: process.env.storageaccesskey,
    secretAccessKey: process.env.storageaccesskeysecret,
  }
});

const spacesEndpointNalozi = new aws.Endpoint("fra1.digitaloceanspaces.com/nalozi");
const s3Nalozi = new aws.S3({
  endpoint: spacesEndpointNalozi,
  credentials: {
    accessKeyId: process.env.storageaccesskey,
    secretAccessKey: process.env.storageaccesskeysecret,
  }
});

const spacesEndpointPrijemnice = new aws.Endpoint("fra1.digitaloceanspaces.com/prijemniceTest");
const s3Prijemnice = new aws.S3({
  endpoint: spacesEndpointPrijemnice,
  credentials: {
    accessKeyId: process.env.storageaccesskey,
    secretAccessKey: process.env.storageaccesskeysecret,
  }
});


/*const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: 'poslovi-grada-2024',
    acl: 'public-read',
    key: function (request, file, cb) {
      console.log(file);
      cb(null, new Date().getTime().toString() + file.originalname);
    }
  })
}).array('image', 10);*/

//110164390

const uploadSlika = multer({
  storage: multerS3({
    s3: s3Slike,
    bucket: 'poslovi-grada-2024',
    acl: 'public-read',
    shouldTransform: function (req, file, cb) {
      cb(null, /^image/i.test(file.mimetype))
    },
    transforms: [{
      id: 'original',
      key: function (req, file, cb) {
      	var filename = "";
      	if(req.body){
      		if(req.body.json){
      			filename = JSON.parse(req.body.json).broj;
      		}
      	}
        cb(null, filename+ "--"+new Date().getTime().toString() +".jpg")
      },
      transform: function (req, file, cb) {
        cb(null, sharp({ failOnError: false }).resize(800,null).withMetadata().jpeg())
      }
    }/*, {
      id: 'thumbnail',
      key: function (req, file, cb) {
        cb(null, "Compressed-"+new Date().getTime().toString() +".jpg")
      },
      transform: function (req, file, cb) {
        cb(null, sharp().resize(1400,1900, {kernel: sharp.kernel.nearest,fit: 'contain',position: 'center center',background: { r: 255, g: 255, b: 255, alpha: 1 }}).jpeg())
      }
    }*/]
  })
}).array('image', 20);

const uploadNalozi = multer({
  storage: multerS3({
    s3: s3Nalozi,
    bucket: 'poslovi-grada-2024',
    acl: 'public-read',
    key: function (request, file, cb) {
      cb(null, new Date().getTime().toString() +"-"+ file.originalname);
    }
  })
}).single('nalog');

const uploadPrijemnica = multer({
  storage: multerS3({
    s3: s3Prijemnice,
    bucket: 'poslovi-grada-2024',
    acl: 'public-read',
    key: function (request, file, cb) {
      cb(null, new Date().getTime().toString() +"-"+ file.originalname);
    }
  })
}).array('prijemnica',500);

var mailPotpis = "<br>&nbsp;<br>Срдачан поздрав,<br>ВиК Портал Послова Града<br><img style='width:200px' src='https://portal.poslovigrada.rs/images/logo.png'>";
var resetPassLimit = 1.8e6; //30 minuta
var podizvodjaci  = ["SeHQZ--1672650353244","IIwY4--1672650358507","e3MHS--1675759749849","eupy8--1676039178890","S5mdP--1677669290493","0ztkS--1672041761145","ylSnq--1672041756318","mile--1672650353244"];
var radneJedinice = ["NOVI BEOGRAD","ZEMUN","ČUKARICA","SAVSKI VENAC","VRAČAR","RAKOVICA","ZVEZDARA","VOŽDOVAC","STARI GRAD","PALILULA"];
var meseciJson    = [{name:"Februar 2024",string:"02.2024"},{name:"Mart 2024",string:"03.2024"},{name:"April 2024",string:"04.2024"},{name:"Maj 2024",string:"05.2024"},{name:"Jun 2024",string:"06.2024"},{name:"Jul 2024",string:"07.2024"},{name:"Avgust 2024",string:"08.2024"},{name:"Septembar 2024",string:"09.2024"},{name:"Oktobar 2024",string:"10.2024"},{name:"Novembar 2024",string:"11.2024"},{name:"Decembar 2024",string:"12.2024"},{name:"Januar 2025",string:"01.2025"},{name:"Februar 2025",string:"02.2025"},{name:"Mart 2025",string:"03.2025"},{name:"April 2024",string:"04.2025"}]
var daniUNedelji 	=	["Недеља","Понедељак","Уторак","Среда","Четвртак","Петак","Субота"];
var istok         = ["ZVEZDARA","RAKOVICA","VOŽDOVAC","STARI GRAD","PALILULA"];
var zapad         = ["NOVI BEOGRAD","ZEMUN","ČUKARICA","VRAČAR","SAVSKI VENAC"];

var phoneAccessCode = generateId(25);
setInterval(function(){
	phoneAccessCode = generateId(25);
	io.emit("phoneAccessCode",phoneAccessCode)
},1.8e+6);

function hashString(string){
	if (typeof string === 'string'){
		var hash	=	crypto.createHash('md5').update(string).digest('hex')
	}else{
		var hash    = "?"
	}
	
	return hash
}

function logError(error){
	console.log(error)
	var errorJSON = {};
	errorJSON.datetime = new Date().getTime();
	errorJSON.date = getDateAsStringForDisplay(new Date());
	errorJSON.error = error.toString()
	errorJSON.jsonerror = error;
	errorJSON.errorstack = error.stack;
	errorJSON.errormessage = error.message;
	if(errorDB){
		errorDB.insertOne(errorJSON)
		.then((dbResponse)=>{
			//console.log(dbResponse)
		}).catch((err)=>{
			console.log(err);
		})	
	}
}

function generateId(length) {
	var result           = [];
	var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	var charactersLength = characters.length;
	for (var i = 0; i < length; i++ ) {
		result.push(characters.charAt(Math.floor(Math.random() * charactersLength)));
	}
	return result.join('');
}

function getDateAsStringForInputObject(date){
	var yearString	=	date.getFullYear();
	var month		=	eval(date.getMonth()+1);
	var monthString	=	(month<10) ? "0" + month : month;
	var day			=	date.getDate();
	var dayString	=	(day<10) ? "0" + day : day;
	return	yearString+"-"+monthString+"-"+dayString;
}

function getDateAsStringForDisplay(date){
	var yearString	=	date.getFullYear();
	var month		=	eval(date.getMonth()+1);
	var monthString	=	(month<10) ? "0" + month : month;
	var day			=	date.getDate();
	var dayString	=	(day<10) ? "0" + day : day;
	return	dayString+"."+monthString+"."+yearString;
}

function getDatetimeFromSerbia(str){//gets dd.mm.yyyy
	var array = str.split(".");
	return new Date(array[2]+"-"+array[1]+"-"+array[0]).getTime()
}

function reshuffleDate(date){//gets yyyy-mm-dd and returns dd.mm.yyyy
  var array = date.split("-");
  return  array[2]+"."+array[1]+"."+array[0];
}

function istiDatum(d1, d2) {
  return d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();
}

function arraysEqual(a, b) {
	if (a === b) return true;
	if (a == null || b == null) return false;
	if (a.length !== b.length) return false;

	for (var i = 0; i < a.length; ++i) {
	  if (a[i] !== b[i]) return false;
	}
	return true;
}

function parseNalog(data,user,lokacija){
	//datumi se upisuju kao dd.mm.yyyy
	var nalogArray	=	data.split("\n");
	var currentDate = new Date();
	var nalogJson	=	{
		uniqueId: generateId(15) +"--"+ new Date().getTime().toString(),
		digitalizacija: {
			datetime: currentDate.getTime(),
			datum: getDateAsStringForDisplay(currentDate),
			korisnik: {
				ime: user.name,
				id: user.email
			},
			lokacija: lokacija
		},
		broj: "",
		punaAdresa: "",
		adresa: "",
		opis:"",
		vrstaRada: "",
		radnaJedinica: "",
		datum:{
			punDatum: "",
			datum: "",
			datetime: 0
		},
		obracun:[],
		ukupanIznos: 0,
		ukupanIznosPodizvodjaca: 0,
		kategorijeRadova: [],
		statusNaloga: "Primljen",
		majstor: "",
		faktura:{
			pdv:"35",
			broj:"",
			penal:0,
			samoBroj:0,
			premijus:{},
			pg:{},
			podizvodjac:{},
			datum:{
				datetime: 0,
				datum: ""
			}
		},
		prijemnica:{
			broj: "",
			validanObracun: false,//true ako se parsePrijemnice pokaze da radi posao
			iznosSaCenovnika: 0,
			datum:{
				datetime: 0,
				datum: ""
			},
			lokacija: ""
		}
	}
	for(var i=0;i<nalogArray.length;i++){
		var line = nalogArray[i];
		if(nalogArray[i+1]){
			var nextLine	=	nalogArray[i+1];
		}

		//Broj narudzbenice
		if(line.startsWith("N A R U")){
			nalogJson.broj = line.split("br.")[1].trim();
		}

		//Adresa
		if(line.startsWith("Adresa:")){
			nalogJson.punaAdresa	=	"";
			for(var j=1;j<5;j++){
				if(!nalogArray[i+j].startsWith("Radna jed")){
					nalogJson.punaAdresa += nalogArray[i+j].replace(/(\r\n|\n|\r)/gm, "");
				}else{
					break;
				}
			}
			nalogJson.adresa = nalogJson.punaAdresa.split(",")[0]
		}

		//Radna Jedinica
		if(line.startsWith("Radna jed")){
			nalogJson.radnaJedinica	=	"";
			for(var j=1;j<5;j++){
				if(!nalogArray[i+j].startsWith("Zaht")){
					nalogJson.radnaJedinica += nalogArray[i+j].replace(/(\r\n|\n|\r)/gm, "");
				}else{
					break;
				}
			}
			//console.log("Radna Jedinica: " + nalogJson.radnaJedinica);
		}

		//Datum
		if(line.startsWith("Datum:")){
			nalogJson.datum.punDatum	=	"";
			for(var j=1;j<5;j++){
				if(!nalogArray[i+j].startsWith("Vrsta rada:")){
					nalogJson.datum.punDatum += nalogArray[i+j].replace(/(\r\n|\n|\r)/gm, "");
				}else{
					break;
				}
			}
			nalogJson.datum.datum = nalogJson.datum.punDatum.split("god.")[0].split(" 00:")[0];
			nalogJson.datum.datetime = getDatetimeFromSerbia(nalogJson.datum.datum);
		}

		//Opis
		if(line.startsWith("Opis:")){
			nalogJson.opis		=	"";
			for(var j=1;j<5;j++){
				if(!nalogArray[i+j].startsWith("Rad")){
					nalogJson.opis += nalogArray[i+j].replace(/(\r\n|\n|\r)/gm, "");
				}else{
					break;
				}
			}
		}

		//Vrsta Rada
		if(line.startsWith("Vrsta rada:")){
			nalogJson.vrstaRada	=	"";
			for(var j=1;j<5;j++){
				if(!nalogArray[i+j].startsWith("MiV rada:")){
					nalogJson.vrstaRada += nalogArray[i+j].replace(/(\r\n|\n|\r)/gm, "");
				}else{
					break;
				}
			}
		}

		//Zahtevalac
		if(line.startsWith("Zahtevalac:")){
			nalogJson.zahtevalac	=	"";
			for(var j=1;j<5;j++){
				if(!nalogArray[i+j].startsWith("Broj zaht")){
					nalogJson.zahtevalac += nalogArray[i+j].replace(/(\r\n|\n|\r)/gm, "");
				}else{
					break;
				}
			}
			//console.log("Zahtevalac: " + nalogJson.zahtevalac);
		}

	}
	return nalogJson;
}

function parsePrijemnica(textdata){
	var prijemnicaJson = {};
	var rowArray	=	textdata.split("\n");
	for(var i=0;i<rowArray.length;i++){
		if(rowArray[i].includes("CenaUk cena")){
			var loopBreaker = 0;
			var j = i+1;
			var obracunArray = [];
			while(loopBreaker<1000 && !rowArray[j].includes("Inicijalni rok")){
				obracunArray.push(rowArray[j])
				j++;
				loopBreaker++;
			}
			var countedItems = 0;
			for(var j=0;j<obracunArray.length;j++){
				if(obracunArray[j].includes("80.01.") || obracunArray[j].includes("80.02.") || obracunArray[j].includes("80.03.") || obracunArray[j].includes("80.04.")){
					countedItems++;
				}
			}

			var sortedObracunArray = [];
			for(j=1;j<=countedItems;j++){
				for(var k=0;k<obracunArray.length;k++){
					var obracunNumber = Number(obracunArray[k].split("80.0")[0]);
					if(obracunNumber==j){
						sortedObracunArray.push(obracunArray[k]);
						if(obracunArray[k+1]){
							for(var l=k+1;l<obracunArray.length;l++){
								var nextObracunNumber = Number(obracunArray[l].split("80.0")[0]);
								if(nextObracunNumber==j+1){
									break;
								}else{
									sortedObracunArray[sortedObracunArray.length-1]=sortedObracunArray[sortedObracunArray.length-1].toString()+obracunArray[l];
								}
							}
						}
					}
				}
			}
			var obracun = [];
			for(var j=0;j<sortedObracunArray.length;j++){
				var obracunJson = {};
				obracunJson.code = "80.0"+sortedObracunArray[j].split("80.0")[1].substring(0,8);
				//12 je proizvoljna duzina sifre, da bi se sklonilo 0.00 iz sifre, duzina je proizvoljna jer posle sifre ide ime, a ono ima dosta slova
				var ostatak = sortedObracunArray[j].substring(12,sortedObracunArray[j].length-1);
				var quantityIndex = -1;
				for(var k=0;k<ostatak.length;k++){
					if(ostatak[k]=="0" && ostatak[k+1]=="." && ostatak[k+2]=="0" && ostatak[k+3]=="0"){
						quantityIndex = k+4;
						break;
					}
				}
				if(obracunJson.code=="80.04.02.001"){
					var priceStartIndex = -1;
					for(var k=0;k<ostatak.length;k++){
						if(ostatak[k]=="1" && ostatak[k+1]=="." && ostatak[k+2]=="0" && ostatak[k+3]=="0"){
							priceStartIndex = k+4;
							break;
						}
					}
					var price = ostatak.substring(priceStartIndex,ostatak.length-1).split(".")[0]+"."+ostatak.substring(priceStartIndex,ostatak.length-1).split(".")[1][0]+ostatak.substring(priceStartIndex,ostatak.length-1).split(".")[1][1];
					price = price.split(",").join("");
					obracunJson.price = price;
				}
				var foundQuantity = "";
				if(quantityIndex>=0){
					for(var k=quantityIndex;k<ostatak.length;k++){
						foundQuantity = foundQuantity + ostatak[k];
						if(ostatak[k]=="."){
							foundQuantity = foundQuantity + ostatak[k+1]+ostatak[k+2]
							break;
						}
					}
					obracunJson.quantity = foundQuantity;
				}else{
					obracunJson.quantity = false;
					console.log("FAILED QUANTITY");
				}
				//komentarisno ispod ne radi za dvocifrene brojeve 10.00 na primer nije mogaod a nadje
				//obracunJson.quantity = ostatak.split("0.00")[1].split(".")[0] + "."+ostatak.split("0.00")[1].split(".")[1][0] + ostatak.split("0.00")[1].split(".")[1][1];
				obracun.push(obracunJson);
			}
			prijemnicaJson.obracun = obracun;
			/*for(var j=0;j<prijemnicaJson.obracun.length;j++){
				if(prijemnicaJson.obracun[j].code=="80.04.02.001"){
					console.log("PRIJEMNICA SA UVECANOM STAVKOM!!");
					//console.log(textdata)
				}
			}*/
		}
		

		if(rowArray[i].includes("Broj naloga:")){
			prijemnicaJson.nalog = rowArray[i].split("Broj naloga:")[1];
		}
		if(rowArray[i].includes("PRIJEMNICA br.")){
			prijemnicaJson.broj = rowArray[i].split("PRIJEMNICA br.")[1].trim();
		}
		if(rowArray[i].includes("prometa:")){
			prijemnicaJson.datum = rowArray[i+1];
			var tempArray = prijemnicaJson.datum.split(".");
			prijemnicaJson.datetime = new Date(tempArray[2]+"-"+tempArray[1]+"-"+tempArray[0]).getTime();
		}

		if(rowArray[i].includes("Ukupno za plaćanje")){
			var iznosi = rowArray[i+1].slice(4);
			prijemnicaJson.ukupanIznos = iznosi.split(".")[0].replace(/,/g, "")+"."+iznosi.split(".")[1].substring(0,2);
			prijemnicaJson.iznosSaPenalom = iznosi.split(".")[iznosi.split(".").length-2].slice(2).replace(/,/g, "")+"."+iznosi.split(".")[iznosi.split(".").length-1];
			prijemnicaJson.penal = parseFloat(prijemnicaJson.iznosSaPenalom)/parseFloat(prijemnicaJson.ukupanIznos)*100;
		}
	}

	//provera tacnosti obracuna
	var iznosSaCenovnika = 0;
	for(var i=0;i<prijemnicaJson.obracun.length;i++){
		for(var j=0;j<cenovnik.length;j++){
			if(prijemnicaJson.obracun[i].code==cenovnik[j].code){
				iznosSaCenovnika = iznosSaCenovnika + parseFloat(cenovnik[j].price)*parseFloat(prijemnicaJson.obracun[i].quantity);
			}
		}		
	}
	prijemnicaJson.iznosSaCenovnika = iznosSaCenovnika;
	if(parseFloat(prijemnicaJson.iznosSaCenovnika)==parseFloat(prijemnicaJson.ukupanIznos)){
		prijemnicaJson.validanObracun = true;
	}else{
		prijemnicaJson.validanObracun = false;
	}
	
	return prijemnicaJson
}

function brojSaRazmacima(x) {
  if(!x){
    return 0
  }
    numberAsString = x.toString().replace(/,/g, " ")
    var parts = numberAsString.split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    if(parts.length==1){
        parts[1] = "00";
    }else{
        if(parts[1].length==1){
            parts[1]=parts[1]+"0";
        }else if(parts[1].length>2){
          if(Number(parts[1][2])>5){
            var lastDigit = Number(parts[1][1])+1;
          }else{
            var lastDigit = Number(parts[1][1])
          }
          if(lastDigit==10){
            parts[1] = eval(Number(parts[1][0])+1).toString() + "0";
          }else{
            parts[1] = eval(Number(parts[1][0])).toString() + lastDigit;
          }
            parts[1]=parts[1][0].toString() + lastDigit;
            //parts[1]=parts[1][0].toString() + parts[1][1].toString();
        }
    }
    return parts.join(",");
}

function dhm(t){
    var cd = 24 * 60 * 60 * 1000,
        ch = 60 * 60 * 1000,
        d = Math.floor(t / cd),
        h = Math.floor( (t - d * cd) / ch),
        m = Math.round( (t - d * cd - h * ch) / 60000),
        pad = function(n){ return n < 10 ? '0' + n : n; };
  if( m === 60 ){
    h++;
    m = 0;
  }
  if( h === 24 ){
    d++;
    h = 0;
  }
  return [d, pad(h), pad(m)].join(':');
}

function getMonday(date) {
  const day = date.getDay(); // Get the current day of the week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
  const diff = day === 0 ? -6 : 1 - day; // Adjust so that Monday is the first day
  const monday = new Date(date);
  monday.setDate(date.getDate() + diff);
  return monday;
}

function smartSplitCSVLine(line) {
  const result = [];
  let current = '';
  let insideQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        // Escaped quote (""), add one quote
        current += '"';
        i++; // Skip next quote
      } else {
        // Toggle insideQuotes
        insideQuotes = !insideQuotes;
      }
    } else if (char === ',' && !insideQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current); // Push the last field

  return result;
}

var navigacijaInfo = [];
var cenovnik;
var cenovnik2024;
var cenovnikHigh;
var cenovnikLow;
var usersDB;
var nalozi2024DB;
var naloziDB;
var istorijaNalogaDB;
var majstoriDB;
var izvestajiDB;
var pricesDB;
var prices2024DB;
var pricesHighDB;
var pricesHigh2024DB;
var pricesLowDB;
var proizvodiDB;
var ucinakMajstoraDB;
var errorDB;
var navigacijaInfoDB;
var dodeljivaniNaloziDB;
var stambenoDB;
var stambeno2DB;
var pomocniciDB;
var checkInMajstoraDB;
var ekipeDB;
var opomeneDB;
var dnevniIzvestajiDB;
var stopoviDB;
var trecaLicaDB;
var cenovniciTrecihLicaDB;
var naloziTrecihLicaDB;
var izvestajiTrecihLicaDB;
var stariCenovnikJsons = [];

http.listen(process.env.PORT, async function(){
	console.log("Poslovi Grada 2024");
	console.log("Server Started v1.4");
	console.log("Timezone offset: "+new Date().getTimezoneOffset())
	console.log("----------------------------------")
	console.log("Connecting to database....");
	var dbConnectionStart	=	new Date().getTime();
	client.connect()
	.then(async () => {
		console.log("Connected to database in " + eval(new Date().getTime()/1000-dbConnectionStart/1000).toFixed(2)+"s")
		usersDB								=	client.db("Poslovi_Grada_2024").collection('Users');
		nalozi2024DB					=	client.db("Poslovi_Grada_2024").collection('Nalozi');
		naloziDB							=	client.db("Poslovi_Grada_2024").collection('Nalozi 2025');
		istorijaNalogaDB			=	client.db("Poslovi_Grada_2024").collection('istorijaNaloga');
		majstoriDB						=	client.db("Poslovi_Grada_2024").collection('Majstori');
		izvestajiDB						=	client.db("Poslovi_Grada_2024").collection('Izvestaji');
		pricesDB							=	client.db("Poslovi_Grada_2024").collection('Cenovnik 2025');
		prices2024DB					=	client.db("Poslovi_Grada_2024").collection('Cenovnik');
		pricesHighDB					=	client.db("Poslovi_Grada_2024").collection('CenovnikHigh2025');
		pricesHigh2024DB					=	client.db("Poslovi_Grada_2024").collection('CenovnikHigh');
		pricesLowDB						=	client.db("Poslovi_Grada_2024").collection('CenovnikLow');
		ucinakMajstoraDB			=	client.db("Poslovi_Grada_2024").collection('ucinakMajstora');
		proizvodiDB						=	client.db("Poslovi_Grada_2024").collection('magacinProizvodi');
		magacinUlaziDB				=	client.db("Poslovi_Grada_2024").collection('magacinUlazi');
		magacinReversiDB			=	client.db("Poslovi_Grada_2024").collection('magacinReversi');
		specifikacijePodizvodjacaDB			=	client.db("Poslovi_Grada_2024").collection('specifikacijePodizvodjaca');
		errorDB								=	client.db("Poslovi_Grada_2024").collection('errors');
		stambenoDB 						=	client.db("Poslovi_Grada_2024").collection('PortalStambeno');
		stambeno2DB 					=	client.db("Poslovi_Grada_2024").collection('PortalStambeno2');
		navigacijaInfoDB			=	client.db("Poslovi_Grada_2024").collection('NavigacijaInfo');
		dodeljivaniNaloziDB		=	client.db("Poslovi_Grada_2024").collection('dodeljivaniNalozi');
		pomocniciDB						=	client.db("Poslovi_Grada_2024").collection('Pomocnici');
		prisustvoDB						=	client.db("Poslovi_Grada_2024").collection('Prisustvo');
		portalStambenoTestDB	=	client.db("Poslovi_Grada_2024").collection('portalStambenoTest');
		checkInMajstoraDB			=	client.db("Poslovi_Grada_2024").collection('checkInMajstora');
		ekipeDB								=	client.db("Poslovi_Grada_2024").collection('Ekipe');
		opomeneDB							=	client.db("Poslovi_Grada_2024").collection('Opomene');
		dnevniIzvestajiDB			=	client.db("Poslovi_Grada_2024").collection('dnevniIzvestaji');
		stopoviDB							=	client.db("Poslovi_Grada_2024").collection('Stopovi');
		trecaLicaDB						=	client.db("Poslovi_Grada_2024").collection('Treca Lica');
		cenovniciTrecihLicaDB = client.db("Poslovi_Grada_2024").collection('Cenovnici Trecih Lica')
		naloziTrecihLicaDB 		= client.db("Poslovi_Grada_2024").collection('Nalozi Trecih Lica');
		izvestajiTrecihLicaDB = client.db("Poslovi_Grada_2024").collection('Izvestaji Trecih Lica');


		nalozi2023DB					=	client.db("Poslovi-Grada").collection('nalozi');
		nalozi2022DB					=	client.db("Poslovi-Grada").collection('nalozi2022');
		stariIzvestajiDB			=	client.db("Poslovi-Grada").collection('izvestaji-sa-terena');
		stariCenovnikDB				=	client.db("Poslovi-Grada").collection('Cenovnik');
		stariUcinakMajstoraDB	=	client.db("Poslovi-Grada").collection('UcinakMajstora');
		stariProizvodiDB			=	client.db("Poslovi-Grada").collection('magacin-proizvodi-4');
		stariMagacinUlaziDB		=	client.db("Poslovi-Grada").collection('magacin-ulazi-4');
		stariMagacinReversiDB	=	client.db("Poslovi-Grada").collection('magacin-reversi-4');


		/*nalozi2023DB.find({}).toArray()
		.then((nalozi)=>{
			var naloziToExport = [];
			var odNaloga = 1834;
			var doNaloga = 3201;
			var brojeviFaktura = []
			for(var i=1834;i<=3201;i++){
				var json = {};
				json.broj = i;
				json.nalog = {};
				brojeviFaktura.push(json);
			}

			for(var i=0;i<brojeviFaktura.length;i++){
				for(var j=0;j<nalozi.length;j++){
					if(nalozi[j].brojFakture){
						if(nalozi[j].brojFakture.includes("/2024")){
							if(brojeviFaktura[i].broj==Number(nalozi[j].brojFakture.toLowerCase().split("/")[0].split("s-")[1])){
								brojeviFaktura[i].nalog = JSON.parse(JSON.stringify(nalozi[j]));
								break;
							}
						}
					}
				}
			}


			var ukupanIznos = 0;
			var osnovica = 0;
			var neoporezivo = 0;
			var csvString = "Broj fakture;Broj Naloga;Iznos Naloga;Pdv\r\n";
			for(var i=0;i<brojeviFaktura.length;i++){
				var iznosNaloga = parseFloat(brojeviFaktura[i].nalog.ukupanIznos);
				if(isNaN(iznosNaloga)){
					console.log("NEDEFINISAN IZNOS!!!!")
				}else{
					ukupanIznos = ukupanIznos + iznosNaloga;
					var pdv = 0;
					if(iznosNaloga<500000){
						osnovica = osnovica + iznosNaloga;
						pdv = iznosNaloga*0.2;
					}else{
						neoporezivo = neoporezivo + iznosNaloga;
					}
				}
				csvString += brojeviFaktura[i].nalog.brojFakture +";"+ brojeviFaktura[i].nalog.broj +";"+brojeviFaktura[i].nalog.ukupanIznos+";"+pdv+"\r\n";
			}

			console.log("Ukupan iznos: " + brojSaRazmacima(ukupanIznos))
			console.log("Osnovica: " + brojSaRazmacima(osnovica))
			console.log("Neoporezivo: " + brojSaRazmacima(neoporezivo))
			fs.writeFileSync("./februar2024.csv",csvString,{encoding:"utf8"});
			console.log("Wrote file")

		})
		.catch((error)=>{
			console.log(error)
		})*/

		/*stariCenovnikDB.find({}).toArray()
		.then((stariCenovnik)=>{
			var csvString = "Stavka;Cena\r\n";
			for(var i=0;i<stariCenovnik.length;i++){
				csvString += stariCenovnik[i].name +";"+stariCenovnik[i].price+"\r\n"
			}
			fs.writeFileSync("./stariCenovnik.csv",csvString,{encoding:"utf8"});
			console.log("Wrote file");
		})
		.catch((error)=>{
			console.log(error)
		})

		pricesDB.find({}).toArray()
		.then((stariCenovnik)=>{
			var csvString = "Stavka;Cena\r\n";
			for(var i=0;i<stariCenovnik.length;i++){
				csvString += stariCenovnik[i].name +";"+stariCenovnik[i].price+"\r\n"
			}
			fs.writeFileSync("./cenovnik.csv",csvString,{encoding:"utf8"});
			console.log("Wrote file");
		})
		.catch((error)=>{
			console.log(error)
		})*/

		navigacijaInfo = await navigacijaInfoDB.find({}).toArray();
		console.log("Navigacija inicijalizovana");		
		cenovnik = await pricesDB.find({}).toArray();
		cenovnik2024 = await prices2024DB.find({}).toArray();
		stariCenovnik = await stariCenovnikDB.find({}).toArray()
		cenovnikHigh = await pricesHighDB.find({}).toArray()
		cenovnikHigh2024 = await pricesHigh2024DB.find({}).toArray()
		cenovnikLow = await pricesLowDB.find({}).toArray()
		console.log("Cenovnici inicijalizovani");

		/*var cenovnikPodizvodjaca = await pricesDB.find({}).toArray();
		for(var i=0;i<cenovnikPodizvodjaca.length;i++){
			cenovnikPodizvodjaca[i].price = "???";
			//console.log(cenovnikPodizvodjaca[i].code)
		}

		console.log("***************************************************************************************");
		console.log("***************************************************************************************");
		console.log("***************************************************************************************");
		console.log("***************************************************************************************");
		console.log("***************************************************************************************");
		var stringArray = fs.readFileSync("podizvodjaci.csv",{encoding:"utf8"}).split("\r\n");
		for(var i=0;i<stringArray.length;i++){
			var array = smartSplitCSVLine(stringArray[i]);
			for(var j=0;j<cenovnikPodizvodjaca.length;j++){
				if(cenovnikPodizvodjaca[j].code==array[0]){
					//console.log(array[0])
					cenovnikPodizvodjaca[j].price = parseFloat(array[1].replace(/,/g, ''));
				}
			}

		}
		var counter = 0;
		for(var i=0;i<cenovnikPodizvodjaca.length;i++){
			if(cenovnikPodizvodjaca[i].price=="???"){
				//console.log(cenovnikPodizvodjaca[i])
				counter++;
				if(isNaN(cenovnikPodizvodjaca[i].price)){
					console.log("Problem: ")
					console.log(cenovnikPodizvodjaca[i])
				}
			}
		}
		console.log("DONE")
		var response = await pricesHighDB.insertMany(cenovnikPodizvodjaca);
		console.log(response)*/

		//var response = await pricesHighDB.insertMany(toInsert);
		//console.log(response);

		/*var stringArray = fs.readFileSync("noviCenovnik.csv",{encoding:"utf8"}).split("\r\n");
		var toInsert = [];
		for(var i=0;i<stringArray.length;i++){
			var array = smartSplitCSVLine(stringArray[i]);
			var json = {};
			//code,name,unit,price
			json.code = array[1];
			json.name = array[2];
			json.unit = array[3];
			json.price = parseFloat(array[4].replace(/,/g, ''));
			json.marker = 2;
			toInsert.push(json);
		}
		var response = await pricesDB.insertMany(toInsert);
		console.log(response);*/

		

		/*var nalozi2024 = await nalozi2024DB.find({"digitalizacija.stambeno.vik":"VIK 2025"}).toArray();
		var brojeviNaloga = []
		for(var i=0;i<nalozi2024.length;i++){
			brojeviNaloga.push(nalozi2024[i].broj)
		}
		var response = await nalozi2024DB.deleteMany({broj:{$in:brojeviNaloga}});
		console.log(response)*/
		

		/*proizvodiDB.find({}).toArray()
		.then((proizvodi)=>{
			proizvodi.sort((a, b) => {
			  const aParts = a.code.split('.').map(Number);
			  const bParts = b.code.split('.').map(Number);
			  
			  for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
			    const aPart = aParts[i] || 0;
			    const bPart = bParts[i] || 0;
			    if (aPart !== bPart) {
			      return aPart - bPart;
			    }
			  }
			  return 0;
			});
			var csvString = "Sifra,Naziv\r\n";
			for(var i=0;i<proizvodi.length;i++){
				csvString += proizvodi[i].code +","+proizvodi[i].name+"\r\n";
			}
			fs.writeFileSync("magacin.csv",csvString,{encoding:"utf8"});
			console.log("Wrote file");
		})
		.catch((error)=>{
			console.log(error)
		})*/
		
		/*var magacinCsv = fs.readFileSync("./magacin.csv",{encoding:"utf8"});
		var magacinCsvArray = magacinCsv.split("\r\n");
		magacinCsvArray.splice(0,1);
		var itemsArray = [];
		for(var i=0;i<magacinCsvArray.length;i++){
			var itemArray = magacinCsvArray[i].split(";");
			if(itemArray[2]!=""){
				if(itemArray[2].startsWith("80")){
					var codesArray = itemArray[2].split(/\s+/).filter(code => code.trim() !== "");
					var json = {};
					json.magacinCode = itemArray[0];
					json.codes = codesArray;
					itemsArray.push(json);
				}
				
			}
		}


		async function updateItems(itemsArray, proizvodiDB) {
		    for (const value of itemsArray) {
		        const setObj = { $set: { codes: value.codes } };
		        const result = await proizvodiDB.updateOne({ code: value.magacinCode }, setObj);
		        console.log(result);
		    }
		}

		updateItems(itemsArray, proizvodiDB)
    .then(() => console.log("All updates complete"))
    .catch(err => console.error("Error updating items:", err));*/




		//ZA KNJIGOVODJU

		/*naloziDB.find({}).toArray()
		.then((nalozi)=>{
			var naloziToExport = [];
			var month = "12"
			for(var i=0;i<nalozi.length;i++){
				if(nalozi[i].faktura.broj){
					if(nalozi[i].faktura.broj.length>3){
						if(nalozi[i].prijemnica.datum.datum.includes("."+month+".2024")){
							naloziToExport.push(nalozi[i])
						}
					}
					
				}
			}

			for(var i=0;i<naloziToExport.length;i++){
				if(naloziToExport[i].prijemnica.datum.datum){
					if(naloziToExport[i].prijemnica.datum.datum.length>3){
						var dateElements = naloziToExport[i].prijemnica.datum.datum.split(".");
						naloziToExport[i].sorting = new Date(dateElements[2]+"-"+dateElements[1]+"-"+dateElements[0]).getTime();
					}
				}
			}

			naloziToExport.sort((a, b) => parseFloat(b.sorting) - parseFloat(a.sorting));

			var problemNalozi = [];

			var csvString = "Datum,Broj Fakture,Konto,Stranka,Prazno,Prazno,Datum,Datum,Prazno,Prazno,Duguje,Potrazuje,Prazno,Prazno\r\n";
			for(var i=0;i<naloziToExport.length;i++){
				var iznosBezPDVa = parseFloat(naloziToExport[i].ukupanIznos)*0.675;
				if(!isNaN(iznosBezPDVa)){
					if(iznosBezPDVa<500000){
						var iznosPDV = iznosBezPDVa*0.2;
						var iznosSaPDVom = iznosBezPDVa*1.2;
						var datumPDV = "";
						if(naloziToExport[i].prijemnica.datum.datum){
							if(naloziToExport[i].prijemnica.datum.datum.length>3){
								datumPDV = naloziToExport[i].prijemnica.datum.datum;
								csvString+=datumPDV+","+naloziToExport[i].faktura.broj+",2040,1,,,"+datumPDV+","+datumPDV+",,,"+iznosSaPDVom+",,,,\r\n";
								csvString+=datumPDV+","+naloziToExport[i].faktura.broj+",6142,,,,"+datumPDV+","+datumPDV+",,,,"+iznosBezPDVa+",,,\r\n";
								csvString+=datumPDV+","+naloziToExport[i].faktura.broj+",4700,,,,"+datumPDV+","+datumPDV+",,,,"+iznosPDV+",,,\r\n";
							}else{
								naloziToExport[i].problem = "Nema polja definisan datum prometa";
								problemNalozi.push(naloziToExport[i])
							}
						}
					}else if(iznosBezPDVa==0){
						naloziToExport[i].problem = "Iznos naloga je nula";
						problemNalozi.push(naloziToExport[i]);
					}else{
						naloziToExport[i].problem = "Iznos preko pola miliona";
						problemNalozi.push(naloziToExport[i]);
					}
				}else{
					naloziToExport[i].problem = "Nedefinisan iznos";
					problemNalozi.push(naloziToExport[i]);
				}
			}
			for(var i=0;i<problemNalozi.length;i++){
				csvString+="NAPOMENA:"+",Broj fakture: "+problemNalozi[i].faktura.broj+",Broj naloga: "+problemNalozi[i].broj+",Problem: "+problemNalozi[i].problem+", , , , , , , , , , ,\r\n";
			}
			fs.writeFileSync("./Minimax-"+month+"-2024.csv",csvString,"utf8");
			console.log("Written ")
		})
		.catch((error)=>{
			console.log(error)
		})*/















		//ZA PREMIJUS

		/*var nalozi = await naloziDB.find({}).toArray();
		var hmNalozi = await client.db("Hausmajstor").collection('Nalozi').find({}).toArray();
		for(var i=0;i<hmNalozi.length;i++){
			//hmNalozi.vrstaRada = "HAUSMAJSTOR"
			nalozi.push(hmNalozi[i])
		}

		var naloziToExport = [];
		var month = 6;
		for(var i=0;i<nalozi.length;i++){
			if(nalozi[i].faktura.broj){
				if(nalozi[i].faktura.broj.length>3){
					if(nalozi[i].prijemnica.datum.datum.includes("."+month.toString().padStart(2,'0')+".2025")){
						naloziToExport.push(nalozi[i])
					}
				}
			}
		}

		for(var i=0;i<naloziToExport.length;i++){
			if(naloziToExport[i].prijemnica.datum.datum){
				if(naloziToExport[i].prijemnica.datum.datum.length>3){
					var dateElements = naloziToExport[i].prijemnica.datum.datum.split(".");
					naloziToExport[i].sorting = new Date(dateElements[2]+"-"+dateElements[1]+"-"+dateElements[0]).getTime();
				}
			}
		}

		naloziToExport.sort((a, b) => parseFloat(b.sorting) - parseFloat(a.sorting));

		var problemNalozi = [];

		var csvString = "Broj Fakture;Datum PDV;Iznos/Osnovica;Penal;PDV;Iznos sa penalom i PDV;PG Iznos/Osnovica;PG PDV;PG Penal;PG Iznos sa PDVom;Vrsta Naloga\r\n";
		for(var i=0;i<naloziToExport.length;i++){
			var osnovica = parseFloat(naloziToExport[i].ukupanIznos);
			var iznosPenala = eval(osnovica* (100 - naloziToExport[i].faktura.penal)/100);
			var pdv = osnovica<=500000 ? osnovica*0.2 : 0;
			var iznosSaPenalomIPdv = osnovica + pdv - iznosPenala;
			var umanjenje = naloziToExport[i].vrstaRada=="HAUSMAJSTOR" ? 1 : 0.675;
			var pgOsnovica = osnovica * umanjenje;
			var pgPdv = pgOsnovica <=500000 ? pgOsnovica*0.2 : 0;
			var pgPenal = iznosPenala;
			var pgIznosSaPDVom = pgOsnovica + pgPdv - pgPenal;

			if(!isNaN(osnovica)){
				datumPDV = naloziToExport[i].prijemnica.datum.datum;
				csvString += naloziToExport[i].faktura.broj + ";" + datumPDV + ";" + osnovica.toFixed(2) + ";" + iznosPenala.toFixed(2) + ";" + pdv.toFixed(2) + ";" + iznosSaPenalomIPdv.toFixed(2) + ";" +pgOsnovica.toFixed(2) + ";" + pgPdv.toFixed(2) + ";" + pgPenal.toFixed(2) + ";" + pgIznosSaPDVom.toFixed(2) + ";" + naloziToExport[i].vrstaRada + "\r\n"
				
				//csvString += naloziToExport[i].faktura.broj + "," +datumPDV+ "," + iznosBezPDVa + "," + pdv + "," + iznosSaPDVom+"\r\n";
				if(osnovica==0){
					naloziToExport[i].problem = "Iznos naloga je nula";
					console.log(naloziToExport[i].broj)
					console.log("Nula")
					problemNalozi.push(naloziToExport[i]);
				}
			}else{
				naloziToExport[i].problem = "Nedefinisan iznos";
				console.log("Nema iznos");
				problemNalozi.push(naloziToExport[i]);
			}
		}
		for(var i=0;i<problemNalozi.length;i++){
			csvString+="NAPOMENA:"+",Broj fakture: "+problemNalozi[i].faktura.broj+" , Broj naloga: "+problemNalozi[i].broj+",Problem: "+problemNalozi[i].problem+", \r\n";
		}
		fs.writeFileSync("./PG-Premijus-"+month+"-2025.csv",csvString,"utf8");
		console.log("Written Premijus")*/






		/*naloziDB.find({}).toArray()
		.then((nalozi)=>{
			var naloziToExport = [];
			var month = 5;
			for(var i=0;i<nalozi.length;i++){
				if(nalozi[i].faktura.broj){
					if(nalozi[i].faktura.broj.length>3){
						if(nalozi[i].prijemnica.datum.datum.includes("."+month.toString().padStart(2,'0')+".2025")){
							naloziToExport.push(nalozi[i])
						}
					}
					
				}
			}

			for(var i=0;i<naloziToExport.length;i++){
				if(naloziToExport[i].prijemnica.datum.datum){
					if(naloziToExport[i].prijemnica.datum.datum.length>3){
						var dateElements = naloziToExport[i].prijemnica.datum.datum.split(".");
						naloziToExport[i].sorting = new Date(dateElements[2]+"-"+dateElements[1]+"-"+dateElements[0]).getTime();
					}
				}
			}

			naloziToExport.sort((a, b) => parseFloat(b.sorting) - parseFloat(a.sorting));

			var problemNalozi = [];

			var csvString = "Broj Fakture,Datum PDV,Iznos/Osnovica,Penal,PDV,Iznos sa penalom i PDV,PG Iznos/Osnovica,PG PDV,PG Penal,PG Iznos sa PDVom\r\n";
			for(var i=0;i<naloziToExport.length;i++){
				var osnovica = parseFloat(naloziToExport[i].ukupanIznos);
				var iznosPenala = eval(osnovica* (100 - naloziToExport[i].faktura.penal)/100);
				var pdv = osnovica<=500000 ? osnovica*0.2 : 0;
				var iznosSaPenalomIPdv = osnovica + pdv - iznosPenala;
				var pgOsnovica = osnovica * 0.675;
				var pgPdv = pgOsnovica <=500000 ? pgOsnovica*0.2 : 0;
				var pgPenal = iznosPenala;
				var pgIznosSaPDVom = pgOsnovica + pgPdv - pgPenal;

				if(!isNaN(osnovica)){
					datumPDV = naloziToExport[i].prijemnica.datum.datum;
					csvString += naloziToExport[i].faktura.broj + "," + datumPDV + "," + osnovica.toFixed(2) + "," + iznosPenala.toFixed(2) + "," + pdv.toFixed(2) + "," + iznosSaPenalomIPdv.toFixed(2) + "," +pgOsnovica.toFixed(2) + "," + pgPdv.toFixed(2) + "," + pgPenal.toFixed(2) + "," + pgIznosSaPDVom.toFixed(2) + "\r\n"
					
					//csvString += naloziToExport[i].faktura.broj + "," +datumPDV+ "," + iznosBezPDVa + "," + pdv + "," + iznosSaPDVom+"\r\n";
					if(osnovica==0){
						naloziToExport[i].problem = "Iznos naloga je nula";
						console.log(naloziToExport[i].broj)
						console.log("Nula")
						problemNalozi.push(naloziToExport[i]);
					}
				}else{
					naloziToExport[i].problem = "Nedefinisan iznos";
					console.log("Nema iznos");
					problemNalozi.push(naloziToExport[i]);
				}
			}
			for(var i=0;i<problemNalozi.length;i++){
				csvString+="NAPOMENA:"+",Broj fakture: "+problemNalozi[i].faktura.broj+" , Broj naloga: "+problemNalozi[i].broj+",Problem: "+problemNalozi[i].problem+", \r\n";
			}
			fs.writeFileSync("./PG-Premijus-"+month+"-2025.csv",csvString,"utf8");
			console.log("Written Premijus")
		})
		.catch((error)=>{
			console.log(error)
		})*/






		/*
			crpljenje 35.04.16.017, 35.04.16.006, 35.04.16.012, 35.04.16.013
			lift 35.04.16.005, 35.04.16.010
			odgusenje 35.03.14.001, 35.03.14.007, 35.03.14.005
		*/
		/*naloziDB.find({}).toArray()
		.then((nalozi)=>{
			var meseci = [{ime:"Mart 2024",nalozi:0,odgusenja:0,crpljenja:0,str:"03.2024"},{ime:"April 2024",nalozi:0,odgusenja:0,crpljenja:0,str:"04.2024"},{ime:"Maj 2024",nalozi:0,odgusenja:0,crpljenja:0,str:"05.2024"},{ime:"Jun 2024",nalozi:0,odgusenja:0,crpljenja:0,str:"06.2024"},{ime:"Jul 2024",nalozi:0,odgusenja:0,crpljenja:0,str:"07.2024"},{ime:"Avgust 2024",nalozi:0,odgusenja:0,crpljenja:0,str:"08.2024"},{ime:"Septembar 2024",nalozi:0,odgusenja:0,crpljenja:0,str:"09.2024"}];
			//Stari Hermina
			//mart do januar
			for(var i=0;i<nalozi.length;i++){
				for(var j=0;j<meseci.length;j++){
					if(nalozi[i].datum.datum.includes(meseci[j].str)){
						meseci[j].nalozi++;

						var odgusenje = false;
						for(var k=0;k<nalozi[i].obracun.length;k++){
							//80.02.09.001, 80.02.09.002, 80.02.09.004
							if(nalozi[i].obracun[k].code=="80.02.09.005" || nalozi[i].obracun[k].code=="80.02.09.001" || nalozi[i].obracun[k].code=="80.02.09.002" || nalozi[i].obracun[k].code=="80.02.09.004"){
								odgusenje = true;
								meseci[j].odgusenja++;
								break;
							}
						}

						var crpljenje = false;
						for(var k=0;k<nalozi[i].obracun.length;k++){
							//80.02.09.010,011,012,
							if(nalozi[i].obracun[k].code=="80.02.09.019" || nalozi[i].obracun[k].code=="80.02.09.010" || nalozi[i].obracun[k].code=="80.02.09.011" || nalozi[i].obracun[k].code=="80.02.09.012"){
									crpljenje = true;
									meseci[j].crpljenja++;
									break;
							}
						}

						var lift = false;
						for(var k=0;k<nalozi[i].obracun.length;k++){
							if(nalozi[i].obracun[k].code=="80.02.09.009"){
									lift = true;
									meseci[j].crpljenja++;
							}
						}
					}
				}
			}
			console.log(meseci);

			nalozi2023DB.find({}).toArray()
			.then((stariNalozi)=>{
				var meseciStari = [{ime:"Mart 2023",nalozi:0,odgusenja:0,crpljenja:0,str:"03.2023"},{ime:"April 2023",nalozi:0,odgusenja:0,crpljenja:0,str:"04.2023"},{ime:"Maj 2023",nalozi:0,odgusenja:0,crpljenja:0,str:"05.2023"},{ime:"Jun 2023",nalozi:0,odgusenja:0,crpljenja:0,str:"06.2023"},{ime:"Jul 2023",nalozi:0,odgusenja:0,crpljenja:0,str:"07.2023"},{ime:"Avgust 2023",nalozi:0,odgusenja:0,crpljenja:0,str:"08.2023"},{ime:"Septembar 2023",nalozi:0,odgusenja:0,crpljenja:0,str:"09.2023"}];
				for(var i=0;i<stariNalozi.length;i++){
					for(var j=0;j<meseciStari.length;j++){
						if(stariNalozi[i].datum.includes(meseciStari[j].str)){
							meseciStari[j].nalozi++;
							var odgusenje = false;
							for(var k=0;k<stariNalozi[i].fakturisanje.length;k++){
								//35.03.14.001, 35.03.14.007, 35.03.14.005
								if(stariNalozi[i].fakturisanje[k].sifraArtikla == "35.03.14.001" || stariNalozi[i].fakturisanje[k].sifraArtikla == "35.03.14.007" || stariNalozi[i].fakturisanje[k].sifraArtikla == "35.03.14.005"){
									odgusnje = true;
									meseciStari[j].odgusenja++;
									break;
								}
							}

							var crpljenje = false;
							for(var k=0;k<stariNalozi[i].fakturisanje.length;k++){
								//35.04.16.017, 35.04.16.006, 35.04.16.012, 35.04.16.013
								if(stariNalozi[i].fakturisanje[k].sifraArtikla == "35.04.16.017" || stariNalozi[i].fakturisanje[k].sifraArtikla == "35.04.16.006" || stariNalozi[i].fakturisanje[k].sifraArtikla == "35.04.16.012" || stariNalozi[i].fakturisanje[k].sifraArtikla == "35.04.16.013"){
									crpljenje = true;
									meseciStari[j].crpljenja++;
									break;
								}
							}

							var lift = false;
							for(var k=0;k<stariNalozi[i].fakturisanje.length;k++){
								//35.04.16.005, 35.04.16.010
								if(stariNalozi[i].fakturisanje[k].sifraArtikla == "35.04.16.005" || stariNalozi[i].fakturisanje[k].sifraArtikla == "35.04.16.010"){
									lift = true;
									meseciStari[j].crpljenja++;
									break
								}
							}
						}
						



					}
				}
				console.log("------------------------------------");
				console.log("STARI UGOVOR");
				console.log(meseciStari);
			})

		})
		.catch((error)=>{
			console.log(error)
		})*/


		/*naloziDB.find({majstor:{$in:podizvodjaci},statusNaloga:{$in:["Spreman za fakturisanje","Fakturisan"]}}).toArray()
		.then((nalozi)=>{
			var naloziToShow = []
			var ukupnaSuma = 0;
			var ukupnoNaloga = 0;
			var Oktobar28 = 1730073600000;
			var Novembar30 = 1732924800000;
			for(var i=0;i<nalozi.length;i++){
				if(nalozi[i].datum.datetime>Oktobar28 && nalozi[i].datum.datetime<Novembar30){
					naloziToShow.push(nalozi[i])
				}
			}

			for(var i=0;i<naloziToShow.length;i++){
				//console.log(naloziToShow[i].ukupanIznos)
				ukupnaSuma = ukupnaSuma + parseFloat(naloziToShow[i].ukupanIznos);
				ukupnoNaloga++;
			}

			console.log("Iznos PG:" + brojSaRazmacima(ukupnaSuma));
			console.log("Broj naloga:" + ukupnoNaloga);
		})
		.catch((error)=>{
			console.log(error);
		})*/



		/*naloziDB.find({}).toArray()
		.then((nalozi)=>{
			var naloziToExport = [];
			var dateStart = new Date("2025-03-01");
			var dateEnd = new Date("2025-04-16");
			var sifre = ["80.02.09.001","80.02.09.002","80.02.09.005","80.02.10.007","80.02.09.022","80.02.09.020","80.02.09.021"];
			for(var i=0;i<nalozi.length;i++){
				var odlazak = false;
				if(Number(nalozi[i].datum.datetime)>dateStart.getTime() && Number(nalozi[i].datum.datetime)<dateEnd.getTime()){
					for(var j=0;j<nalozi[i].obracun.length;j++){
						if(nalozi[i].obracun[j].code=="80.04.01.002"){
							odlazak=true;
							break;
						}
					}

					for(var j=0;j<nalozi[i].obracun.length;j++){
						if(sifre.indexOf(nalozi[i].obracun[j].code)>=0 && odlazak==true){
							naloziToExport.push(nalozi[i]);
							break;
						}
					}
				}
			}
			var csvString = "Broj Naloga,Datum,Radna Jedinica,Adresa,Status,Iznos\r\n";
			for(var i=0;i<naloziToExport.length;i++){
				csvString += naloziToExport[i].broj+","+naloziToExport[i].datum.datum+","+naloziToExport[i].radnaJedinica+","+naloziToExport[i].adresa+","+naloziToExport[i].statusNaloga+","+naloziToExport[i].ukupanIznos+"\r\n"
			}
			fs.writeFileSync("./marija.csv",csvString,"utf8");	


			console.log("Wrote file 1")
		})
		.catch((error)=>{
			console.log(error)
		})*/

		/*naloziDB.find({}).toArray()
		.then((nalozi)=>{
			var naloziToExport = [];
			var dateCutOff = new Date("2025-01-15");
			var sifre = ["80.02.10.007"];
			for(var i=0;i<nalozi.length;i++){
				if(Number(nalozi[i].datum.datetime)>dateCutOff.getTime()){
					for(var j=0;j<nalozi[i].obracun.length;j++){
						if(sifre.indexOf(nalozi[i].obracun[j].code)>=0){
							naloziToExport.push(nalozi[i]);
							break;
						}
					}
				}
			}
			var csvString = "Broj Naloga,Datum,Radna Jedinica,Adresa,Status,Iznos\r\n";
			for(var i=0;i<naloziToExport.length;i++){
				csvString += naloziToExport[i].broj+","+naloziToExport[i].datum.datum+","+naloziToExport[i].radnaJedinica+","+naloziToExport[i].adresa+","+naloziToExport[i].statusNaloga+","+naloziToExport[i].ukupanIznos+"\r\n"
			}
			fs.writeFileSync("./10_007.csv",csvString,"utf8");	


			console.log("Wrote file 2")
		})
		.catch((error)=>{
			console.log(error)
		})*/

		/*var meseci = [];

		for(var i=2022;i<=2025;i++){
			for(var j=1;j<=12;j++){
				if(j==2 && i==2025){
					break;
				}
				var json = {};
				json.mesec = j.toString().padStart(2,"0")+"."+i.toString();
				json.mesecBroj = j;
				json.godinaBroj = i;
				json.nalozi = [];
				meseci.push(json)
			}
		}

		naloziDB.find({}).toArray()
		.then((nalozi2024)=>{
			nalozi2023DB.find({}).toArray()
			.then((nalozi2023)=>{
				nalozi2022DB.find({}).toArray()
				.then((nalozi2022)=>{
					for(var i=0;i<meseci.length;i++){
						for(var j=0;j<nalozi2022.length;j++){
							if(nalozi2022[j].datum.includes(meseci[i].mesec)){
								meseci[i].nalozi.push(nalozi2022[j])
							}
						}

						for(var j=0;j<nalozi2023.length;j++){
							if(nalozi2023[j].datum.includes(meseci[i].mesec)){
								meseci[i].nalozi.push(nalozi2023[j])
							}
						}

						for(var j=0;j<nalozi2024.length;j++){
							if(nalozi2024[j].datum.datum.includes(meseci[i].mesec)){
								meseci[i].nalozi.push(nalozi2024[j])
							}
						}
					}
					console.log(meseci)
					var csvString = "Broj;Datum;Mesec;Godina;Tip;Iznos\r\n";
					for(var i=0;i<meseci.length;i++){
						
						for(var j=0;j<meseci[i].nalozi.length;j++){
							if(!isNaN(parseFloat(meseci[i].nalozi[j].ukupanIznos))){
								csvString += meseci[i].nalozi[j].broj+";";
								if (typeof meseci[i].nalozi[j].datum === 'string' || meseci[i].nalozi[j].datum instanceof String){
									csvString += meseci[i].nalozi[j].datum.split("god")[0];
								}else{
									csvString += meseci[i].nalozi[j].datum.datum;
								}
								csvString+=";"+meseci[i].mesecBroj+";"+meseci[i].godinaBroj+";TIP;"+meseci[i].nalozi[j].ukupanIznos+"\r\n";
							}
							
						}
					}
					fs.writeFileSync("./Nalozi.csv",csvString,"utf8");
					console.log("Wrote File")

				})
				.catch((error)=>{
					console.log(error);
				})
			})
			.catch((error)=>{
				console.log(error)
			})
		})
		.catch((error)=>{
			console.log(error);
		})*/

		/*for(var i=2024;i<=2024;i++){
			for(var j=1;j<=12;j++){
				var json = {};
				json.mesec = j.toString().padStart(2,"0")+"."+i.toString();
				json.mesecBroj = j;
				json.godinaBroj = i;
				json.nalozi = [];
				meseci.push(json)
			}
		}


		naloziDB.find({}).toArray()
		.then((nalozi)=>{
			for(var i=0;i<meseci.length;i++){
				for(var j=0;j<nalozi.length;j++){
					if(nalozi[j].datum.datum.includes(meseci[i].mesec)){
						meseci[i].nalozi.push(nalozi[j])
					}
				}
			}

		console.log(meseci)
			
			var woma = ["80.02.09.020","80.02.09.021","80.02.09.022"];
			var rucno = ["80.02.09.001","80.02.09.002","80.02.09.003","80.02.09.004","80.02.09.005"];
			var crp = ["80.02.09.009","80.02.09.010","80.02.09.012","80.02.09.025"];
			var kop = ["80.03.01.001","80.03.01.002","80.03.01.003","80.03.01.025"];
			var mas = ["80.03.01.019","80.03.01.020","80.03.01.025"];
			var kup = ["80.01.05.057","80.01.05.058","80.01.05.059","80.01.05.060","80.01.05.061","80.01.05.062","80.01.05.063","80.01.05.064"];

			var csvString = "Broj;Datum;Mesec;Godina;Opstina;Tip;Iznos\r\n";
			for(var i=0;i<meseci.length;i++){
				
				for(var j=0;j<meseci[i].nalozi.length;j++){
					meseci[i].nalozi[j].tipNaloga = "ZAMENA";
					var kategorisan = false;
					for(var k=0;k<meseci[i].nalozi[j].obracun.length;k++){
						if(mas.indexOf(meseci[i].nalozi[j].obracun[k].code)>=0){
							meseci[i].nalozi[j].tipNaloga = "BAGER";
							kategorisan = true;
							break;
						}
					}

					if(!kategorisan){
						for(var k=0;k<meseci[i].nalozi[j].obracun.length;k++){
							if(kop.indexOf(meseci[i].nalozi[j].obracun[k].code)>=0){
								meseci[i].nalozi[j].tipNaloga = "KOPANJE";
								kategorisan = true;
								break;
							}
						}	
					}

					if(!kategorisan){
						for(var k=0;k<meseci[i].nalozi[j].obracun.length;k++){
							if(woma.indexOf(meseci[i].nalozi[j].obracun[k].code)>=0){
								meseci[i].nalozi[j].tipNaloga = "WOMA";
								kategorisan = true;
								break;
							}
						}
					}

					if(!kategorisan){
						for(var k=0;k<meseci[i].nalozi[j].obracun.length;k++){
							if(rucno.indexOf(meseci[i].nalozi[j].obracun[k].code)>=0){
								if(parseFloat(meseci[i].nalozi[j].ukupanIznos)<20000){
									meseci[i].nalozi[j].tipNaloga = "SAJLA";
									kategorisan = true;
									break;
								}
							}
						}
					}

					if(!kategorisan){
						for(var k=0;k<meseci[i].nalozi[j].obracun.length;k++){
							if(crp.indexOf(meseci[i].nalozi[j].obracun[k].code)>=0){
								if(parseFloat(meseci[i].nalozi[j].ukupanIznos)<10000){
									meseci[i].nalozi[j].tipNaloga = "CRPLJENJE";
									kategorisan = true;
									break;
								}
							}
						}
					}

					if(!kategorisan){
						for(var k=0;k<meseci[i].nalozi[j].obracun.length;k++){
							if(kup.indexOf(meseci[i].nalozi[j].obracun[k].code)>=0){
								if(parseFloat(meseci[i].nalozi[j].ukupanIznos)<5500){
									meseci[i].nalozi[j].tipNaloga = "SPOJKA";
									kategorisan = true;
									break;
								}
							}
						}
					}

					if(!kategorisan){
						for(var k=0;k<meseci[i].nalozi[j].obracun.length;k++){
							if(kup.indexOf(meseci[i].nalozi[j].obracun[k].code)>=0){
								if(parseFloat(meseci[i].nalozi[j].ukupanIznos)<5500){
									meseci[i].nalozi[j].tipNaloga = "SPOJKA";
									kategorisan = true;
									break;
								}
							}
						}
					}

					if(!kategorisan){
						if(meseci[i].nalozi[j].obracun.length==2){
							if(meseci[i].nalozi[j].obracun[0].code=="80.04.01.002" && meseci[i].nalozi[j].obracun[1].code=="80.04.01.005"){
								meseci[i].nalozi[j].tipNaloga = "LOKALNO";
								kategorisan = true;
							}else if(meseci[i].nalozi[j].obracun[0].code=="80.04.01.005" && meseci[i].nalozi[j].obracun[1].code=="80.04.01.002"){
								meseci[i].nalozi[j].tipNaloga = "LOKALNO";
								kategorisan = true;
							}
						}else if(meseci[i].nalozi[j].obracun.length==1){
							if(meseci[i].nalozi[j].obracun[0].code=="80.04.01.002" || meseci[i].nalozi[j].obracun[0].code=="80.04.01.005"){
								meseci[i].nalozi[j].tipNaloga = "LOKALNO";
								kategorisan = true;
							}
						}
					}
					

					if(!isNaN(parseFloat(meseci[i].nalozi[j].ukupanIznos))){
						csvString += meseci[i].nalozi[j].broj+";";
						if (typeof meseci[i].nalozi[j].datum === 'string' || meseci[i].nalozi[j].datum instanceof String){
							csvString += meseci[i].nalozi[j].datum.split("god")[0];
						}else{
							csvString += meseci[i].nalozi[j].datum.datum;
						}
						csvString+=";"+meseci[i].mesecBroj+";"+meseci[i].godinaBroj+";"+meseci[i].nalozi[j].radnaJedinica+";"+meseci[i].nalozi[j].tipNaloga+";"+meseci[i].nalozi[j].ukupanIznos+"\r\n";
					}else{
						console.log("BEZ IZNOSA!!!!")
					}
					
				}
			}
			fs.writeFileSync("./Nalozi2024-5.csv",csvString,"utf8");
			console.log("Wrote File 4")
		})
		.catch((error)=>{
			console.log(error);
		})*/


		/*naloziDB.find({"datum.datum":{$regex:"01.2025"},majstor:{$in:podizvodjaci}}).toArray()
		.then((nalozi)=>{
			console.log(nalozi.length)
			console.log(nalozi);
			majstoriDB.find({uniqueId:{$in:podizvodjaci}}).toArray()
			.then((majstori)=>{
				for(var i=0;i<majstori.length;i++){
					majstori[i].nalozi = 0;
					majstori[i].brojevi = [];
					for(var j=0;j<nalozi.length;j++){
						if(majstori[i].uniqueId==nalozi[j].majstor){
							majstori[i].nalozi++;
							majstori[i].brojevi.push(nalozi[j].broj);
						}
					}
				}
				console.log(majstori)
			})
		})
		.catch((error)=>{
			console.log(error)
		})*/

		/*naloziDB.find({$or: [{ "datum.datum": { $regex: "01\\.2025" } },{ "datum.datum": { $regex: "02\\.2025" } }],majstor:{$in:podizvodjaci}}).toArray()
		.then((nalozi)=>{
			majstoriDB.find({}).toArray()
			.then((majstori)=>{
				for(var i=0;i<nalozi.length;i++){
					for(var j=0;j<majstori.length;j++){
						if(nalozi[i].majstor==majstori[j].uniqueId){
							nalozi[i].imeMajstora = majstori[j].ime;
						}
					}
				}
				console.log(nalozi)
				var csvString = "Ime,Broj Naloga,Datum"+"\r\n";
				for(var i=0;i<nalozi.length;i++){
					csvString += nalozi[i].imeMajstora+","+nalozi[i].broj+","+nalozi[i].datum.datum+"\r\n"
				}
				fs.writeFileSync("marija.csv",csvString,{encoding:"utf8"});
				console.log("Wrote file")
			})
			.catch((error)=>{
				console.log(error);
			})
		})
		.catch((error)=>{
			console.log(error)
		})*/

		/*const isFirst7Numbers = str => /^\d{7}/.test(str);
		var potvrdjeni = fs.readFileSync("Nalozi.csv",{encoding:"utf8"});
		var potvrdjeniArray = potvrdjeni.split("\n");
		var potvrdjeniBrojevi = [];
		for(var i=0;i<potvrdjeniArray.length;i++){
			if(isFirst7Numbers(potvrdjeniArray[i].split(",")[0])){
				potvrdjeniBrojevi.push(potvrdjeniArray[i].split(",")[0].toString())
			}
		}

		naloziDB.find({"prijemnica.datum.datum":{$regex:"02.2025"},statusNaloga:{$in:["Fakturisan","Spreman za fakturisanje"]}}).toArray()
		.then((nalozi)=>{
			naloziDB.find({broj:{$in:potvrdjeniBrojevi}}).toArray()
			.then((nalozi2)=>{
				for(var i=0;i<nalozi2.length;i++){
					nalozi.push(nalozi2[i])
				}
				var ukupanIznos = 2754875.53;
				var osnovicaZaPDV = 0;
				var neoporezivo = 1820171.20;
				for(var i=0;i<nalozi.length;i++){
					ukupanIznos = ukupanIznos + parseFloat(nalozi[i].ukupanIznos);
					if(parseFloat(nalozi[i].ukupanIznos)<500000){
						osnovicaZaPDV = osnovicaZaPDV + parseFloat(nalozi[i].ukupanIznos)
					}else{
						neoporezivo = neoporezivo + parseFloat(nalozi[i].ukupanIznos);
					}
				}
				console.log("Ukupno bez PDV: "+brojSaRazmacima(ukupanIznos))
				console.log("Osnovica za PDV: "+brojSaRazmacima(osnovicaZaPDV))
				console.log("Neoporezivo: "+brojSaRazmacima(neoporezivo))
				console.log("PDV: "+brojSaRazmacima(osnovicaZaPDV*0.2))
			})
			
		})
		.catch((error)=>{
			console.log(error)
		})*/

		//09.03

		/*naloziDB.find({"prijemnica.datum.datum":{$regex:"03.2025"}}).toArray()
		.then((totalNalozi)=>{
			var brojeviNaloga = [];
			for(var i=0;i<totalNalozi.length;i++){
				brojeviNaloga.push(totalNalozi[i].broj)
			}
			naloziDB.find({statusNaloga:{$nin:["Fakturisan","Storniran"]}}).toArray()
			.then((nalozi2)=>{
				for(var i=0;i<nalozi2.length;i++){
					if(brojeviNaloga.indexOf(nalozi2[i].broj)<0){
						totalNalozi.push(nalozi2[i])
					}
				}

				var nalozi = [];
				//var startDate = "2025-03-10";
				//var endDate = "2025-03-14";
				for(var i=0;i<totalNalozi.length;i++){
					//if(totalNalozi[i].datum.datetime>new Date(startDate).getTime() &&totalNalozi[i].datum.datetime<new Date(endDate).getTime() ){
						nalozi.push(totalNalozi[i])
					//}
				}
				
				var woma = ["80.02.09.020","80.02.09.021","80.02.09.022"];
				var rucno = ["80.02.09.001","80.02.09.002","80.02.09.003","80.02.09.004","80.02.09.005"];
				var crp = ["80.02.09.009","80.02.09.010","80.02.09.012","80.02.09.025"];
				var kop = ["80.03.01.001","80.03.01.002","80.03.01.003","80.03.01.025"];
				var mas = ["80.03.01.019","80.03.01.020","80.03.01.025"];
				var kup = ["80.01.05.057","80.01.05.058","80.01.05.059","80.01.05.060","80.01.05.061","80.01.05.062","80.01.05.063","80.01.05.064"];

				for(var i=0;i<nalozi.length;i++){
					nalozi[i].tipNaloga = "ZAMENA";
				}


				for(var i=0;i<nalozi.length;i++){
					if(nalozi[i].tipNaloga=="ZAMENA"){
						for(var k=0;k<nalozi[i].obracun.length;k++){
							if(kop.indexOf(nalozi[i].obracun[k].code)>=0){
								nalozi[i].tipNaloga = "KOPANJE";
							}
						}
					}
					

					if(nalozi[i].tipNaloga=="ZAMENA"){
						for(var k=0;k<nalozi[i].obracun.length;k++){
							if(woma.indexOf(nalozi[i].obracun[k].code)>=0){
								nalozi[i].tipNaloga = "WOMA";
							}
						}
					}

					

					if(nalozi[i].tipNaloga=="ZAMENA"){
						for(var k=0;k<nalozi[i].obracun.length;k++){
							if(rucno.indexOf(nalozi[i].obracun[k].code)>=0){
								if(parseFloat(nalozi[i].ukupanIznos)<20000){
									nalozi[i].tipNaloga = "SAJLA";
								}
							}
						}
					}

					

					if(nalozi[i].tipNaloga=="ZAMENA"){
						for(var k=0;k<nalozi[i].obracun.length;k++){
							if(crp.indexOf(nalozi[i].obracun[k].code)>=0){
								if(parseFloat(nalozi[i].ukupanIznos)<10000){
									nalozi[i].tipNaloga = "CRPLJENJE";
								}
							}
						}
					}

					

					if(nalozi[i].tipNaloga=="ZAMENA"){
						for(var k=0;k<nalozi[i].obracun.length;k++){
							if(kup.indexOf(nalozi[i].obracun[k].code)>=0){
								if(parseFloat(nalozi[i].ukupanIznos)<5500){
									nalozi[i].tipNaloga = "SPOJKA";
								}
							}
						}
					}

					

					if(nalozi[i].tipNaloga=="ZAMENA"){
						for(var k=0;k<nalozi[i].obracun.length;k++){
							if(kup.indexOf(nalozi[i].obracun[k].code)>=0){
								if(parseFloat(nalozi[i].ukupanIznos)<5500){
									nalozi[i].tipNaloga = "SPOJKA";
								}
							}
						}
					}

					
					if(nalozi[i].tipNaloga=="ZAMENA"){
						if(nalozi[i].obracun.length==2){
							if(nalozi[i].obracun[0].code=="80.04.01.002" && nalozi[i].obracun[1].code=="80.04.01.005"){
								nalozi[i].tipNaloga = "LOKALNO";
							}else if(nalozi[i].obracun[0].code=="80.04.01.005" && nalozi[i].obracun[1].code=="80.04.01.002"){
								nalozi[i].tipNaloga = "LOKALNO";
							}
						}else if(nalozi[i].obracun.length==1){
							if(nalozi[i].obracun[0].code=="80.04.01.002" || nalozi[i].obracun[0].code=="80.04.01.005"){
								nalozi[i].tipNaloga = "LOKALNO";
							}
						}
					}
				}

				var csvString = "Broj naloga;Radna Jedinica;Datum Naloga; Datum Prijemnice;Tip Naloga; Iznos\r\n";
				for(var i=0;i<nalozi.length;i++){
					csvString += nalozi[i].broj + ";" +nalozi[i].radnaJedinica +";"+ nalozi[i].datum.datum + ";" + nalozi[i].prijemnica.datum.datum+ ";" + nalozi[i].tipNaloga + ";"+nalozi[i].ukupanIznos+"\r\n"; 
				}					
				fs.writeFileSync("nalozi.csv",csvString,{encoding:"Utf8"})
				console.log("Wrote file")

			})
		})
		.catch((error)=>{
			console.log(error)
		})*/

		/*majstoriDB.find({uniqueId:{$nin:podizvodjaci}}).toArray()
		.then((majstori)=>{
			for(var i=0;i<majstori.length;i++){
				console.log(majstori[i].ime)
				console.log(brojSaRazmacima(majstori[i].mesecnaPlata))
				console.log("------------------------------------")
			}
		})
		.catch((error)=>{
			console.log(error)
		})*/


		//poruke za zakazivanje , telefonski automat, reklamacija (moze vise)



		/*naloziDB.find({}).toArray()
		.then((nalozi)=>{
			var ukupnoNaloga = 0;
			var ukupanIznos = 0;
				var woma = ["80.02.09.020","80.02.09.021","80.02.09.022"];
				var kop = ["80.03.01.001","80.03.01.002","80.03.01.003","80.03.01.025"];
				for(var i=0;i<nalozi.length;i++){
						for(var k=0;k<nalozi[i].obracun.length;k++){
							if(kop.indexOf(nalozi[i].obracun[k].code)>=0){
								nalozi[i].tipNaloga = "KOPANJE";
							}
						}
					

					if(nalozi[i].tipNaloga!="KOPANJE"){
						for(var k=0;k<nalozi[i].obracun.length;k++){
							if(woma.indexOf(nalozi[i].obracun[k].code)>=0){
								nalozi[i].tipNaloga = "WOMA";
								ukupnoNaloga++;
								ukupanIznos = ukupanIznos + parseFloat(nalozi[i].ukupanIznos)
								break;
							}
						}
					}
				}
				console.log("Broj Naloga: "+ukupnoNaloga)
				console.log("Iznos: "+brojSaRazmacima(ukupanIznos))

		})
		.catch((error)=>{
			console.log(error)
		})*/



		/*dodeljivaniNaloziDB.find({"datum.datum":{$regex:"02.2025"}}).toArray()
		.then((dodele)=>{
			var array = [];
			for(var i=0;i<radneJedinice.length;i++){
				var json = {};
				json.radnaJedinica = radneJedinice[i];
				json.dates = [];
				var startDate = new Date("2025-02-15");
				for(var j=0;j<13;j++){
					var dateJson = {};
					dateJson.datum = new Date(startDate);
					dateJson.ekipe = [];
					json.dates.push(dateJson);
					startDate.setDate(startDate.getDate()+1);
				}
				//console.log(json)
				array.push(json)
			}
			//console.log(array)

			majstoriDB.find({}).toArray()
			.then((majstori)=>{
				for(var i=0;i<dodele.length;i++){
					for(var j=0;j<majstori.length;j++){
						if(majstori[j].uniqueId==dodele[i].majstor){
							dodele[i].imeMajstora = majstori[j].ime;
						}
					}



					for(var j=0;j<array.length;j++){
						for(var k=0;k<array[j].dates.length;k++){
							if(istiDatum(array[j].dates[k].datum,new Date(dodele[i].datum.datetime)) && dodele[i].radnaJedinica==array[j].radnaJedinica){

								var vecUListi = false;
								for(var l=0;l<array[j].dates[k].ekipe.length;l++){
									if(array[j].dates[k].ekipe[l].uniqueId==dodele[i].majstor){
										vecUListi = true;
									}
								}

								if(!vecUListi){
									var json2 = {};
									json2.uniqueId = dodele[i].majstor;
									json2.imeMajstora = dodele[i].imeMajstora;
									var vecNaNekojOpstini = false;
									for(var l=0;l<array.length;l++){
										if(array[l].radnaJedinica!=array[j].radnaJedinica){
											for(var m=0;m<array[l].dates.length;m++){
												for(var n=0;n<array[l].dates[m].ekipe.length;n++){
													if(array[l].dates[m].ekipe[n].uniqueId==dodele[i].majstor){
														vecNaNekojOpstini = true;
													}
												}
											}
										}
									}

									if(!vecNaNekojOpstini){
										array[j].dates[k].ekipe.push(json2)
									}
								}
							}
						}
					}
				}

				for(var i=0;i<array.length;i++){
					console.log(array[i].radnaJedinica);
					for(var j=0;j<array[i].dates.length;j++){
						console.log("  "+getDateAsStringForDisplay(array[i].dates[j].datum) +" -> "+array[i].dates[j].ekipe.length);
						for(var k=0;k<array[i].dates[j].ekipe.length;k++){
							console.log("        "+array[i].dates[j].ekipe[k].imeMajstora)
						}
					}
				}
			})
			.catch((error)=>{
				console.log(error)
			})
		})
		.catch((error)=>{
			console.log(error)
		})*/

		/*naloziDB.find({"prijemnica.datum.datum":{$regex:"02.2025"}}).toArray()
		.then((nalozi)=>{
			var brojeviNaloga = [];
			for(var i=0;i<nalozi.length;i++){
				brojeviNaloga.push(Number(nalozi[i].broj));
			}
			portalStambenoTestDB.find({broj_naloga:{$in:brojeviNaloga}}).toArray()
			.then((ispravke)=>{
				for(var i=0;i<nalozi.length;i++){
					nalozi[i].ispravke = [];
					for(var j=0;j<ispravke.length;j++){
						if(Number(nalozi[i].broj)==ispravke[j].broj_naloga){
							nalozi[i].ispravke.push(ispravke[j])
						}
					}
					nalozi[i].maxIznos = nalozi[i].ukupanIznos ? parseFloat(nalozi[i].ukupanIznos) : 0;
					for(var j=0;j<nalozi[i].ispravke.length;j++){
						var iznos = 0;
						for(var k=0;k<nalozi[i].ispravke[j].order_lines.length;k++){
							iznos = iznos + parseFloat(nalozi[i].ispravke[j].order_lines[k].ukupna_cena_dobavljaca)
						}
						if(nalozi[i].maxIznos<iznos){
							nalozi[i].maxIznos = parseFloat(iznos)
						}
					}

				}
				var woma = ["80.02.09.020","80.02.09.021","80.02.09.022"];
				var rucno = ["80.02.09.001","80.02.09.002","80.02.09.003","80.02.09.004","80.02.09.005"];
				var crp = ["80.02.09.009","80.02.09.010","80.02.09.012","80.02.09.025"];
				var kop = ["80.03.01.001","80.03.01.002","80.03.01.003","80.03.01.025"];
				var mas = ["80.03.01.019","80.03.01.020","80.03.01.025"];
				var kup = ["80.01.05.057","80.01.05.058","80.01.05.059","80.01.05.060","80.01.05.061","80.01.05.062","80.01.05.063","80.01.05.064"];

				for(var i=0;i<nalozi.length;i++){
					nalozi[i].tipNaloga = "ZAMENA";
				}


				for(var i=0;i<nalozi.length;i++){
					if(nalozi[i].tipNaloga=="ZAMENA"){
						for(var k=0;k<nalozi[i].obracun.length;k++){
							if(kop.indexOf(nalozi[i].obracun[k].code)>=0){
								nalozi[i].tipNaloga = "KOPANJE";
							}
						}
					}
					

					if(nalozi[i].tipNaloga=="ZAMENA"){
						for(var k=0;k<nalozi[i].obracun.length;k++){
							if(woma.indexOf(nalozi[i].obracun[k].code)>=0){
								nalozi[i].tipNaloga = "WOMA";
							}
						}
					}

					

					if(nalozi[i].tipNaloga=="ZAMENA"){
						for(var k=0;k<nalozi[i].obracun.length;k++){
							if(rucno.indexOf(nalozi[i].obracun[k].code)>=0){
								if(parseFloat(nalozi[i].ukupanIznos)<20000){
									nalozi[i].tipNaloga = "SAJLA";
								}
							}
						}
					}

					

					if(nalozi[i].tipNaloga=="ZAMENA"){
						for(var k=0;k<nalozi[i].obracun.length;k++){
							if(crp.indexOf(nalozi[i].obracun[k].code)>=0){
								if(parseFloat(nalozi[i].ukupanIznos)<10000){
									nalozi[i].tipNaloga = "CRPLJENJE";
								}
							}
						}
					}

					

					if(nalozi[i].tipNaloga=="ZAMENA"){
						for(var k=0;k<nalozi[i].obracun.length;k++){
							if(kup.indexOf(nalozi[i].obracun[k].code)>=0){
								if(parseFloat(nalozi[i].ukupanIznos)<5500){
									nalozi[i].tipNaloga = "SPOJKA";
								}
							}
						}
					}

					

					if(nalozi[i].tipNaloga=="ZAMENA"){
						for(var k=0;k<nalozi[i].obracun.length;k++){
							if(kup.indexOf(nalozi[i].obracun[k].code)>=0){
								if(parseFloat(nalozi[i].ukupanIznos)<5500){
									nalozi[i].tipNaloga = "SPOJKA";
								}
							}
						}
					}

					
					if(nalozi[i].tipNaloga=="ZAMENA"){
						if(nalozi[i].obracun.length==2){
							if(nalozi[i].obracun[0].code=="80.04.01.002" && nalozi[i].obracun[1].code=="80.04.01.005"){
								nalozi[i].tipNaloga = "LOKALNO";
							}else if(nalozi[i].obracun[0].code=="80.04.01.005" && nalozi[i].obracun[1].code=="80.04.01.002"){
								nalozi[i].tipNaloga = "LOKALNO";
							}
						}else if(nalozi[i].obracun.length==1){
							if(nalozi[i].obracun[0].code=="80.04.01.002" || nalozi[i].obracun[0].code=="80.04.01.005"){
								nalozi[i].tipNaloga = "LOKALNO";
							}
						}
					}
				}

				var csvString = "Broj naloga;Radna Jedinica;Datum Naloga; Datum Prijemnice;Tip Naloga; Iznos; Max Iznos\r\n";
				for(var i=0;i<nalozi.length;i++){
					csvString += nalozi[i].broj + ";" +nalozi[i].radnaJedinica +";"+ nalozi[i].datum.datum + ";" + nalozi[i].prijemnica.datum.datum+ ";" + nalozi[i].tipNaloga + ";"+nalozi[i].ukupanIznos+";"+nalozi[i].maxIznos+"\r\n"; 
				}					
				fs.writeFileSync("nalozi.csv",csvString,{encoding:"Utf8"})
				console.log("Wrote file")
			})
			.catch((error)=>{
				console.log(error);
			})
		})
		.catch((error)=>{
			console.log(error)
		})*/





		/*naloziDB.find({"prijemnica.datum.datum":{$regex:"03.2025"}}).toArray()
		.then((fakturisaniNalozi)=>{
			naloziDB.find({statusNaloga:{$nin:["Fakturisan","Storniran"]}}).toArray()
			.then((aktivniNalozi)=>{
				var brojeviNaloga = [];
				for(var i=0;i<fakturisaniNalozi.length;i++){
					brojeviNaloga.push(fakturisaniNalozi[i].broj);
				}
				for(var i=0;i<aktivniNalozi.length;i++){
					if(brojeviNaloga.indexOf(aktivniNalozi[i].broj)<0){
						brojeviNaloga.push(aktivniNalozi[i].broj)
					}
				}
				naloziDB.find({broj:{$in:brojeviNaloga}}).toArray()
				.then((nalozi)=>{

					var woma = ["80.02.09.020","80.02.09.021","80.02.09.022"];
					var rucno = ["80.02.09.001","80.02.09.002","80.02.09.003","80.02.09.004","80.02.09.005"];
					var crp = ["80.02.09.009","80.02.09.010","80.02.09.012","80.02.09.025"];
					var kop = ["80.03.01.001","80.03.01.002","80.03.01.003","80.03.01.025"];
					var mas = ["80.03.01.019","80.03.01.020","80.03.01.025"];
					var kup = ["80.01.05.057","80.01.05.058","80.01.05.059","80.01.05.060","80.01.05.061","80.01.05.062","80.01.05.063","80.01.05.064"];

					for(var i=0;i<nalozi.length;i++){
						nalozi[i].tipNaloga = "ZAMENA";
						if(parseFloat(nalozi[i].ukupanIznos)==0){
							nalozi.splice(i,1);
							i--;
						}
					}


					for(var i=0;i<nalozi.length;i++){
						if(nalozi[i].tipNaloga=="ZAMENA"){
							for(var k=0;k<nalozi[i].obracun.length;k++){
								if(kop.indexOf(nalozi[i].obracun[k].code)>=0){
									nalozi[i].tipNaloga = "KOPANJE";
								}
							}
						}
						

						if(nalozi[i].tipNaloga=="ZAMENA"){
							for(var k=0;k<nalozi[i].obracun.length;k++){
								if(woma.indexOf(nalozi[i].obracun[k].code)>=0){
									nalozi[i].tipNaloga = "WOMA";
								}
							}
						}

						

						if(nalozi[i].tipNaloga=="ZAMENA"){
							for(var k=0;k<nalozi[i].obracun.length;k++){
								if(rucno.indexOf(nalozi[i].obracun[k].code)>=0){
									if(parseFloat(nalozi[i].ukupanIznos)<20000){
										nalozi[i].tipNaloga = "SAJLA";
									}
								}
							}
						}

						

						/*if(nalozi[i].tipNaloga=="ZAMENA"){
							for(var k=0;k<nalozi[i].obracun.length;k++){
								if(crp.indexOf(nalozi[i].obracun[k].code)>=0){
									if(parseFloat(nalozi[i].ukupanIznos)<10000){
										nalozi[i].tipNaloga = "CRPLJENJE";
									}
								}
							}
						}

						

						if(nalozi[i].tipNaloga=="ZAMENA"){
							for(var k=0;k<nalozi[i].obracun.length;k++){
								if(kup.indexOf(nalozi[i].obracun[k].code)>=0){
									if(parseFloat(nalozi[i].ukupanIznos)<5500){
										nalozi[i].tipNaloga = "SPOJKA";
									}
								}
							}
						}

						

						if(nalozi[i].tipNaloga=="ZAMENA"){
							for(var k=0;k<nalozi[i].obracun.length;k++){
								if(kup.indexOf(nalozi[i].obracun[k].code)>=0){
									if(parseFloat(nalozi[i].ukupanIznos)<5500){
										//nalozi[i].tipNaloga = "SPOJKA";
									}
								}
							}
						}

						
						if(nalozi[i].tipNaloga=="ZAMENA"){
							if(nalozi[i].obracun.length==2){
								if(nalozi[i].obracun[0].code=="80.04.01.002" && nalozi[i].obracun[1].code=="80.04.01.005"){
									nalozi[i].tipNaloga = "LOKALNO";
								}else if(nalozi[i].obracun[0].code=="80.04.01.005" && nalozi[i].obracun[1].code=="80.04.01.002"){
									nalozi[i].tipNaloga = "LOKALNO";
								}
							}else if(nalozi[i].obracun.length==1){
								if(nalozi[i].obracun[0].code=="80.04.01.002" || nalozi[i].obracun[0].code=="80.04.01.005"){
									nalozi[i].tipNaloga = "LOKALNO";
								}
							}
						}
					}
					var csvString = "Broj naloga;Radna Jedinica;Tip;Iznos\r\n";
					for(var i=0;i<nalozi.length;i++){
						csvString += nalozi[i].broj + ";" +nalozi[i].radnaJedinica +";"+nalozi[i].tipNaloga+";"+ nalozi[i].ukupanIznos+"\r\n"; 
					}					
					fs.writeFileSync("nalozi.csv",csvString,{encoding:"Utf8"})
					console.log("Wrote file");
				})



			})
		})
		.catch((error)=>{
			console.log(error)
		})*/


		/*naloziDB.find({majstor:{$in:podizvodjaci},"datum.datum":{$regex:".2025"}}).toArray()
		.then((nalozi)=>{
			var majstorJson = [];
			for(var i=0;i<podizvodjaci.length;i++){
				var json = {};
				json.uniqueId = podizvodjaci[i];
				json.nalozi = 0;
				majstorJson.push(json);
			}

			majstoriDB.find({uniqueId:{$in:podizvodjaci}}).toArray()
			.then((majstori)=>{
				for(var i=0;i<majstori.length;i++){
					for(var j=0;j<majstorJson.length;j++){
						if(majstorJson[j].uniqueId==majstori[i].uniqueId){
							majstorJson[j].ime = majstori[i].ime;
						}
					}
				}

				for(var i=0;i<majstorJson.length;i++){
					for(var j=0;j<nalozi.length;j++){
						if(majstorJson[i].uniqueId==nalozi[j].majstor){
							majstorJson[i].nalozi++;
						}
					}
					console.log(majstorJson[i].ime + ": "+majstorJson[i].nalozi)
				}
			})
			.catch((error)=>{
				console.log(error)
			})

		})
		.catch((error)=>{
			console.log(error)
		})*/

				

		/*var meseci = [
			{ime:"Maj 2024",str:"05.2024",sorting:0},
			{ime:"Jun 2024",str:"06.2024",sorting:1},
			{ime:"Jul 2024",str:"07.2024",sorting:2},
			{ime:"Avgust 2024",str:"08.2024",sorting:3},
			{ime:"Septembar 2024",str:"09.2024",sorting:4},
			{ime:"Oktobar 2024",str:"10.2024",sorting:5},
			{ime:"Novembar 2024",str:"11.2024",sorting:6},
			{ime:"Decembar 2024",str:"12.2024",sorting:7},
			{ime:"Januar 2025",str:"01.2025",sorting:8},
			{ime:"Februar 2025",str:"02.2025",sorting:9},
			{ime:"Mart 2025",str:"03.2025",sorting:10},
			{ime:"April 2025",str:"04.2025",sorting:11},
			{ime:"Maj 2025",str:"05.2025",sorting:12}
		]

		naloziDB.find({majstor:{$in:podizvodjaci},statusNaloga:{$nin:["Storniran"]}}).toArray()
		.then((nalozi)=>{
			majstoriDB.find({uniqueId:{$in:podizvodjaci}}).toArray()
			.then((majstori)=>{
				pricesLowDB.find({}).toArray()
				.then((pricesLow)=>{
					pricesLowDB.find({}).toArray()
					.then((pricesHigh)=>{
						var cutOff = new Date("2024-05-01");
						var naloziToExport = [];
						for(var i=0;i<nalozi.length;i++){
							if(nalozi[i].datum.datetime>cutOff.getTime()){
								for(var j=0;j<majstori.length;j++){
									if(majstori[j].uniqueId==nalozi[i].majstor){
										nalozi[i].imeMajstora = majstori[j].ime;
										for(var k=0;k<meseci.length;k++){
											if(nalozi[i].datum.datum.includes(meseci[k].str)){
												nalozi[i].mesec = meseci[k].sorting.toString().padStart(2,"0") + " "+ meseci[k].ime;
											}
										}

										var cenovnik;
										if(nalozi[i].majstor=="SeHQZ--1672650353244" || nalozi[i].majstor=="IIwY4--1672650358507"){
											cenovnik = pricesHigh;
										}else{
											cenovnik = pricesLow;
										}

										var ukupanIznosPodizvodjaca = 0;
										for(var k=0;k<nalozi[i].obracun.length;k++){
											for(var l=0;l<cenovnik.length;l++){//code, quantity
												if(cenovnik[l].code==nalozi[i].obracun[k].code){
													ukupanIznosPodizvodjaca = ukupanIznosPodizvodjaca + cenovnik[l].price*parseFloat(nalozi[i].obracun[k].quantity);
												}
											}
										}
										nalozi[i].ukupanIznosPodizvodjaca = ukupanIznosPodizvodjaca;


										naloziToExport.push(nalozi[i])
									}
								}
							}
						}


						

						var csvString = "Broj Naloga;Podizvodjac;Mesec;Iznos PG;Iznos\r\n";
						for(var i=0;i<naloziToExport.length;i++){
							var nalog = naloziToExport[i];
							csvString +=  nalog.broj + ";" + nalog.imeMajstora + ";" + nalog.mesec + ";" + nalog.ukupanIznos + ";" + nalog.ukupanIznosPodizvodjaca + "\r\n";
						}
						fs.writeFileSync("nalozi.csv",csvString,{encoding:"Utf8"})
						console.log("Wrote file");
						


					})
					.catch((error)=>{
						console.log(error);
					});
				})
				.catch((error)=>{
					console.log(error);
				});
			})
			.catch((error)=>{
				console.log(error)
			})
			
		})
		.catch((error)=>{
			console.log(error)
		})*/

		/*naloziDB.find({vrstaRada:"TEKUCE"}).toArray()
		.then((nalozi)=>{
			var startTime = new Date("2024-05-01");
			var novembar = new Date("2024-11-01");
			var naloziToShow = [];
			for(var i=0;i<nalozi.length;i++){
				if(nalozi[i].datum.datetime>=startTime.getTime()){
					naloziToShow.push(nalozi[i])
				}
			}

			var preNovembra = 0;
			var posleNovembra = 0;
			for(var i=0;i<naloziToShow.length;i++){
				if(naloziToShow[i].datum.datetime<=novembar.getTime()){
					preNovembra = preNovembra + parseFloat(naloziToShow[i].ukupanIznos);
				}else if(naloziToShow[i].datum.datetime>novembar.getTime()){
					posleNovembra = posleNovembra + parseFloat(naloziToShow[i].ukupanIznos);
				}
			}

			console.log("Tekuce popravke od 01.05.2024 do 01.11.2024")
			console.log("     "+brojSaRazmacima(parseFloat(preNovembra)));
			console.log("---")

			console.log("Tekuce popravke od 01.11.2024 do danas")
			console.log("     "+brojSaRazmacima(posleNovembra))
			console.log("---")


		})
		.catch((error)=>{
			console.log(error)
		})*/

		/*naloziDB.find({}).toArray()
		.then(async (nalozi)=>{
			var startTime = new Date("2024-05-01");
			var cutOff = new Date("2024-11-01")
			var naloziToShow = [];
			for(var i=0;i<nalozi.length;i++){
				if(nalozi[i].datum.datetime>=startTime.getTime()){
					naloziToShow.push(nalozi[i])
				}
			}

			// Create a lookup map for cenovnik
			const cenovnikMap = {};
			for (const item of cenovnik) {
			    cenovnikMap[item.code] = item.name;
			}

			// Assign names using the map
			for (const nalog of nalozi) {
			    for (const obr of nalog.obracun) {
			        if (cenovnikMap[obr.code]) {
			            obr.name = cenovnikMap[obr.code];
			        }
			    }
			}

			var naloziToExport = [];
			var targets = ['3"', '2"/5"', '2"', '6/4"', '5/4"', '1"', '160' , '125' , '110', 'ventil' , 'Ventil'];
			for(var i=0;i<nalozi.length;i++){
				var isVodovodKanalizacija = false;
				for(var j=0;j<nalozi[i].obracun.length;j++){
					if(nalozi[i].obracun[j].name){
						if(targets.some(str => nalozi[i].obracun[j].name.includes(str))){
							isVodovodKanalizacija = true;
							break;
						}	
					}
					
				}
				if(isVodovodKanalizacija){
					var isStemanje = false;
					for(var j=0;j<nalozi[i].obracun.length;j++){
						if(nalozi[i].obracun[j].code.includes("80.03.03.")){
							var lastNumber = Number(nalozi[i].obracun[j].code.split(".")[3]);
							if(lastNumber>=17 && lastNumber<=138){
								isStemanje = true;
							}
						}
					}
					nalozi[i].tipNaloga = "ZAMENA";
					var masinski = ['80.03.01.020','80.03.01.019'];
					for(var j=0;j<nalozi[i].obracun.length;j++){
						if(nalozi[i].obracun[j].name){
							if(masinski.indexOf(nalozi[i].obracun[j].code)>=0){
								nalozi[i].tipNaloga = "MASINSKI ISKOP";
								break;
							}	
						}
					}

					var rucni = ['80.03.01.001','80.03.01.002','80.03.01.003','80.03.01.004','80.03.01.005','80.03.01.006'];
					if(nalozi[i].tipNaloga!="MASINSKI ISKOP"){
						for(var j=0;j<nalozi[i].obracun.length;j++){
							if(nalozi[i].obracun[j].name){
								if(rucni.indexOf(nalozi[i].obracun[j].code)>=0){
									nalozi[i].tipNaloga = "RUCNI ISKOP";
									break;
								}	
							}
						}	
					}

					if(!isStemanje){
						nalozi[i].vreme = "PRE NOVEMBRA";
						if(nalozi[i].datum.datetime>=cutOff.getTime()){
							nalozi[i].vreme = "POSLE NOVEMBRA";
						}
						naloziToExport.push(nalozi[i])
					}
				}
			}

			var csvString = "Broj naloga;Vreme;Tip naloga;Iznos\r\n";
			for(var i=0;i<naloziToExport.length;i++){
				csvString += naloziToExport[i].broj + ";" + naloziToExport[i].vreme + ";" +naloziToExport[i].tipNaloga+ ";" + naloziToExport[i].ukupanIznos +"\r\n";
			}

			fs.writeFileSync("nalozi.csv",csvString,{encoding:"Utf8"})
						console.log("Wrote file");
			


		})
		.catch((error)=>{
			console.log(error)
		})*/



//ertik, izmedju

		/*naloziDB.find({}).toArray()
		.then(async (nalozi)=>{
			var startTime = new Date("2024-02-01");
			var cutOff = new Date()
			var naloziToShow = [];
			for(var i=0;i<nalozi.length;i++){
				if(nalozi[i].datum.datetime>=startTime.getTime()){
					naloziToShow.push(nalozi[i])
				}
			}

			// Create a lookup map for cenovnik
			const cenovnikMap = {};
			for (const item of cenovnik) {
			    cenovnikMap[item.code] = item.name;
			}

			// Assign names using the map
			for (const nalog of nalozi) {
			    for (const obr of nalog.obracun) {
			        if (cenovnikMap[obr.code]) {
			            obr.name = cenovnikMap[obr.code];
			        }
			    }
			}

			var naloziToExport = [];
			var exported = [];
			var slic = ["80.03.03.017","80.03.03.018","80.03.03.019","80.03.03.020","80.03.03.021","80.03.03.022","80.03.03.023","80.03.03.024"];
			var krpljenje = ["80.03.03.121","80.03.03.122","80.03.03.123","80.03.03.124","80.03.03.125","80.03.03.126","80.03.03.127","80.03.03.128","80.03.03.129","80.03.03.130","80.03.03.131","80.03.03.132","80.03.03.133","80.03.03.133","80.03.03.134","80.03.03.135","80.03.03.136","80.03.03.137","80.03.03.138"];
			for(var i=0;i<nalozi.length;i++){
				var jesteSlic = false;
				var jesteKrp = false;
				for(var j=0;j<nalozi[i].obracun.length;j++){
					if(slic.indexOf(nalozi[i].obracun[j].code)>=0){
						jesteSlic = true;
					}

					if(krpljenje.indexOf(nalozi[i].obracun[j].code)>=0){
						jesteKrp = true;
					}
				}
				if(jesteSlic && jesteKrp){
					exported.push(nalozi[i].broj);
					naloziToExport.push(nalozi[i]);
				}
			}


			var targets = ['ertik', 'ERTIK','spit', 'SPIT','STAN','stan','Stan','st.','St.','ST.'];
			var excludeTargets = ['dgu', 'agu'];
			for (var i = 0; i < nalozi.length; i++) {
				for(var j=0;j<targets.length;j++){
					if(nalozi[i].opis){
						if(nalozi[i].opis.includes(targets[j])){
							if (exported.indexOf(nalozi[i].broj) < 0) {
								var shouldExclude = false;
								for(var k=0;k<excludeTargets.length;k++){
									if(nalozi[i].opis.includes(excludeTargets[k])){
										shouldExclude = true;
									}
								}
								if(!shouldExclude){
									naloziToExport.push(nalozi[i]);
									exported.push(nalozi[i].broj)
								}
								
							}	
						}
					}
					
				}
			}

			var csvString = "Broj naloga;Vreme;Iznos\r\n";
			naloziToExport.sort((a, b) => a.datum.datetime - b.datum.datetime);
			for(var i=0;i<naloziToExport.length;i++){
				csvString += naloziToExport[i].broj + ";" + naloziToExport[i].datum.datum.split(".")[1]+"."+naloziToExport[i].datum.datum.split(".")[2] + ";" + naloziToExport[i].ukupanIznos +"\r\n";
			}

			fs.writeFileSync("nalozi.csv",csvString,{encoding:"Utf8"})
			console.log("Wrote file");
			


		})
		.catch((error)=>{
			console.log(error)
		})*/


		/*naloziDB.find({majstor:{$in:podizvodjaci}}).toArray()
		.then((nalozi)=>{
			var cutOff = new Date("2025-02-01");
			var naloziToExport = [];
			for(var i=0;i<nalozi.length;i++){
				if(Number(nalozi[i].datum.datetime)>cutOff.getTime()){
					naloziToExport.push(nalozi[i])
				}
			}

			majstoriDB.find({uniqueId:{$in:podizvodjaci}}).toArray()
			.then((majstori)=>{
				var json = [];
				for(var i=0;i<majstori.length;i++){
					var tempJson = {};
					tempJson.podizvodjac = majstori[i].ime;
					tempJson.uniqueId = majstori[i].uniqueId;
					tempJson.nalozi = [];
					tempJson.pare = 0;
					json.push(tempJson)
				}

				for(var i=0;i<json.length;i++){
					for(var j=0;j<naloziToExport.length;j++){
						if(naloziToExport[j].majstor==json[i].uniqueId){
							json[i].nalozi.push(naloziToExport[j]);
							if(!isNaN(parseFloat(naloziToExport[j].ukupanIznos))){
								json[i].pare = json[i].pare + parseFloat(naloziToExport[j].ukupanIznos);
							}
						}
					}
				}

				for(var i=0;i<json.length;i++){
					console.log(json[i].podizvodjac)
					console.log("Ukupno novca: "+brojSaRazmacima(json[i].pare));
					console.log("Ukupno naloga: "+json[i].nalozi.length)
					console.log("------------------")
				}



			})
			.catch((error)=>{
				console.log(error)
			})
			

		})
		.catch((error)=>{
			console.log(error)
		})*/


		/*var nalozi = await naloziDB.find({}).toArray();
		var naloziToExport = [];
		for(var i=0;i<nalozi.length;i++){
			if(nalozi[i].prijemnica.datum.datum.includes("05.2025")){
				naloziToExport.push(nalozi[i])
			}
		}
		var brojeviNaloga = [];
		for(var i=0;i<naloziToExport.length;i++){
			brojeviNaloga.push(naloziToExport[i].broj)
		}	
		var reversi = await magacinReversiDB.find({nalog:{$in:brojeviNaloga}}).toArray();

		var proizvodi = await proizvodiDB.find({}).toArray();
		var zaduzeneStavke = [];
		for(var i=0;i<reversi.length;i++){
			for(var j=0;j<reversi[i].zaduzenje.length;j++){
				var stavkaPostoji = false;
				var indexStavke = -1;
				for(var k=0;k<zaduzeneStavke.length;k++){
					if(zaduzeneStavke[k].uniqueId==reversi[i].zaduzenje[j].uniqueId){
						stavkePostoji = true;
						indexStavke = k;
						break;
					}
				}
				var uzeto = isNaN(parseFloat(reversi[i].zaduzenje[j].quantity)) ? 0 : parseFloat(reversi[i].zaduzenje[j].quantity);
				var vraceno = isNaN(parseFloat(reversi[i].zaduzenje[j].quantity2)) ? 0 : parseFloat(reversi[i].zaduzenje[j].quantity2);
				if(stavkaPostoji){
					
					zaduzeneStavke[indexStavke].kolicina += uzeto - vraceno;
				}else{
					var json = {};
					json.uniqueId = reversi[i].zaduzenje[j].uniqueId;
					json.kolicina = uzeto - vraceno;
					zaduzeneStavke.push(json)
				}
			}
		}

		for(var i=0;i<zaduzeneStavke.length;i++){
			zaduzeneStavke[i].cena = 0;
			zaduzeneStavke[i].naziv = 0;
			for(var j=0;j<proizvodi.length;j++){
				if(proizvodi[j].uniqueId==zaduzeneStavke[i].uniqueId){
					zaduzeneStavke[i].cena = isNaN(parseFloat(proizvodi[j].price)) ? 0 : parseFloat(proizvodi[j].price);
					zaduzeneStavke[i].naziv = proizvodi[j].name;
				}
			}
		}

		var csvString = "Naziv;Kolicina;Cena stavke\r\n"
		for(var i=0;i<zaduzeneStavke.length;i++){
			csvString+=zaduzeneStavke[i].naziv+";"+zaduzeneStavke[i].kolicina+";"+zaduzeneStavke[i].cena+"\r\n"
		}
		fs.writeFileSync("potrosnja.csv",csvString,{encoding:"utf8"});
		console.log("Wrote file")*/


		/*var nalozi = await naloziDB.find({"prijemnica.datum.datum":{$regex:"06.2025"}}).toArray()
		console.log(nalozi.length)
		for(var i=0;i<nalozi.length;i++){
			if(podizvodjaci.indexOf(nalozi[i].majstor)<0){
				nalozi.splice(i,1);
				i--;
			}
		}
		console.log(nalozi.length);
		var iznos = 0;
		var naloziPreko50k = 0;
		var iznosStanova = 0;
		var brojStanova = 0;
		var iznosOdgusenja = 0;
		var brojOdgusenja = 0;
		var targets = ['ertik', 'ERTIK','spit', 'SPIT','STAN','stan','Stan','st.','St.','ST.'];
		var odgusenjeCodes = ['80.02.09.001','80.02.09.002','80.02.09.005','80.02.10.007'];
		var odlazak = [];
		var brojeviNaloga = []
		for(var i=0;i<nalozi.length;i++){
			iznos = iznos + parseFloat(nalozi[i].ukupanIznos);
			if(parseFloat(nalozi[i].ukupanIznos)>=50000){
				naloziPreko50k++;
			}

			var jesteStan = false;
			for(var j=0;j<targets.length;j++){
				if(nalozi[i].opis){
					if(nalozi[i].opis.includes(targets[j])){
						jesteStan = true;
					}
				}
			}
			if(jesteStan){
				iznosStanova = iznosStanova + parseFloat(nalozi[i].ukupanIznos);
				brojStanova++;
			}

			var jesteOdgusenje = false;
			for(var j=0;j<nalozi[i].obracun.length;j++){
				if(odgusenjeCodes.indexOf(nalozi[i].obracun[j].code)>0){
					jesteOdgusenje = true;
				}
			}

			if(jesteOdgusenje){
				var jesteOdgusenje = true;
				for(var j=0;j<nalozi[i].obracun.length;j++){
					if(odgusenjeCodes.indexOf(nalozi[i].obracun[j].code)<0 && nalozi[i].obracun[j].code!="80.04.01.002" ){
						jesteOdgusenje = false;
					}
				}
				if(jesteOdgusenje){
					iznosOdgusenja = iznosOdgusenja + parseFloat(nalozi[i].ukupanIznos);
					brojOdgusenja++;
					brojeviNaloga.push(nalozi[i].broj)
				}
				
			}
		}

		console.log("СТАТИСТИКА ПОДИЗВОЂАЧА ЗА МЕСЕЦ ЈУН 2025.")
		console.log("  Укупан износ: " + brojSaRazmacima(iznos) + " дин. / " + nalozi.length + " налога" )
		console.log("  Налози преко 50 000 дин.: " + naloziPreko50k + " налога" )
		console.log("  Одгушења: " + brojSaRazmacima(iznosOdgusenja) + " дин. / " + brojOdgusenja + " налога" )
		console.log("  Станови: " + brojSaRazmacima(iznosStanova) + " дин. / " + brojStanova + " налога" )
		console.log(brojeviNaloga)*/

		/*var nalozi = await naloziDB.find({"prijemnica.datum.datum":{$regex:"06.2025"}}).toArray();
		var sifreOdgusenja = ["80.02.09.001","80.02.09.002","80.02.09.005","80.02.10.007","80.02.10.003"];
		var naloziJson = []
		for(var i=0;i<nalozi.length;i++){
			var imaOdgusenje = false;
			var json = {};
			json.iznos = 0;
			json.nalog = nalozi[i].broj;
			json.radnaJedinica = nalozi[i].radnaJedinica;
			json.adresa = nalozi[i].adresa;
			for(var j=0;j<nalozi[i].obracun.length;j++){
				if(sifreOdgusenja.indexOf(nalozi[i].obracun[j].code)>=0){
					for(var k=0;k<cenovnik.length;k++){
						if(nalozi[i].obracun[j].code==cenovnik[k].code){
							json.iznos = json.iznos + parseFloat(cenovnik[k].price)*parseFloat(nalozi[i].obracun[j].quantity);
							//break;
						}
					}
					imaOdgusenje = true;
				}
			}
			if(imaOdgusenje){
				json.iznos = json.iznos + 1150;
				naloziJson.push(json);
			}
		}

		var csvString = "Broj naloga;Radna Jedinica;Adresa;Iznos\r\n";
		for(var i=0;i<naloziJson.length;i++){
			csvString += naloziJson[i].nalog +";"+naloziJson[i].radnaJedinica+";"+naloziJson[i].adresa+";"+naloziJson[i].iznos+"\r\n";
		}
		fs.writeFileSync("odgusenja.csv",csvString,{encoding:"utf8"});
		console.log("Wrote file")*/

		/*var stavkeStringArray = fs.readFileSync("stavke.csv",{encoding:"utf8"}).split("\r\n");
		var stavke = [];
		for(var i=0;i<stavkeStringArray.length;i++){
			var stavkaJson = {};
			stavkaJson.code = stavkeStringArray[i];
			stavkaJson.koriscenaKolicina = 0;
			stavke.push(stavkaJson);
		}

		console.log("Pocinjem analizu")

		var nalozi = await naloziDB.find({majstor:{$in:podizvodjaci}}).toArray();
		console.log(nalozi.length)
		var ukupnoStavki = 0;
		var ukupnoSaKolicinama = 0;
		var cenovnikAnaliza = await pricesDB.find({}).toArray();
		for(var i=0;i<cenovnikAnaliza.length;i++){
			cenovnikAnaliza[i].korisceno = 0;
			cenovnikAnaliza[i].koriscenaKolicina = 0;
		}
		for(var i=0;i<nalozi.length;i++){
			for(var j=0;j<nalozi[i].obracun.length;j++){
				ukupnoStavki++;
				var kolicina = isNaN(parseFloat(nalozi[i].obracun[j].quantity)) ? 0 : parseFloat(nalozi[i].obracun[j].quantity);
				if(kolicina==0){
					//console.log(nalozi[i].obracun[j].quantity)
				}
				ukupnoSaKolicinama = ukupnoSaKolicinama + kolicina;
			}
		}



		for(var i=0;i<nalozi.length;i++){
			for(var j=0;j<nalozi[i].obracun.length;j++){
				for(var k=0;k<cenovnikAnaliza.length;k++){
					
					if(nalozi[i].obracun[j].code==cenovnikAnaliza[k].code){
						cenovnikAnaliza[k].korisceno++;
						var kolicina = isNaN(parseFloat(nalozi[i].obracun[j].quantity)) ? 0 : parseFloat(nalozi[i].obracun[j].quantity);
						cenovnikAnaliza[k].koriscenaKolicina = cenovnikAnaliza[k].koriscenaKolicina + kolicina;
						break;
					}
				}
			}
		}

		for(var i=0;i<stavke.length;i++){
			for(var j=0;j<cenovnikAnaliza.length;j++){
				if(cenovnikAnaliza[j].code==stavke[i].code){
					stavke[i].koriscenaKolicina = cenovnikAnaliza[j].koriscenaKolicina;
				}
			}
		}

		var csvString = "Sifra;Kolicina\r\n";
		for(var i=0;i<stavke.length;i++){
			csvString += stavke[i].code + ";" + stavke[i].koriscenaKolicina + "\r\n"
		}
		fs.writeFileSync("analiza.csv",csvString,{encoding:"utf8"});
		console.log("wrote file");*/

		/*console.log("Pocinjem analizu")

		var nalozi = await naloziDB.find({}).toArray();
		var ukupnoStavki = 0;
		var ukupnoSaKolicinama = 0;
		var cenovnikAnaliza = await pricesDB.find({}).toArray();
		for(var i=0;i<cenovnikAnaliza.length;i++){
			cenovnikAnaliza[i].korisceno = 0;
			cenovnikAnaliza[i].koriscenaKolicina = 0;
		}
		console.log("Analiziram ukupno stavke")
		for(var i=0;i<nalozi.length;i++){
			for(var j=0;j<nalozi[i].obracun.length;j++){
				ukupnoStavki++;
				var kolicina = isNaN(parseFloat(nalozi[i].obracun[j].quantity)) ? 0 : parseFloat(nalozi[i].obracun[j].quantity);
				if(kolicina==0){
					//console.log(nalozi[i].obracun[j].quantity)
				}
				ukupnoSaKolicinama = ukupnoSaKolicinama + kolicina;
			}
		}
		console.log("Ukupno stavki: "+ukupnoStavki)
		console.log("Ukupno stavki sa kolicinama: "+ukupnoSaKolicinama);

		for(var i=0;i<nalozi.length;i++){
			for(var j=0;j<nalozi[i].obracun.length;j++){
				for(var k=0;k<cenovnikAnaliza.length;k++){
					
					if(nalozi[i].obracun[j].code==cenovnikAnaliza[k].code){
						cenovnikAnaliza[k].korisceno++;
						var kolicina = isNaN(parseFloat(nalozi[i].obracun[j].quantity)) ? 0 : parseFloat(nalozi[i].obracun[j].quantity);
						cenovnikAnaliza[k].koriscenaKolicina = cenovnikAnaliza[k].koriscenaKolicina + kolicina;
						break;
					}
				}
			}
		}


		var maksimum = 6;
		var csvString = "Sifra stavke;Naziv stavke;Jedinica mere;Cena;Ukupno puta korisceno;Procenat Koriscenja;Skaliran procenat koriscenja [6%];Procenat koriscenja kolicina;Skaliran procenat koriscenja kolicina [6%]\r\n";
		for(var i=0;i<cenovnikAnaliza.length;i++){
			cenovnikAnaliza[i].procenatKoriscenja = eval(100*cenovnikAnaliza[i].korisceno/ukupnoStavki);
			cenovnikAnaliza[i].skaliranProcenatKoriscenja = 100*(cenovnikAnaliza[i].procenatKoriscenja)/maksimum;

			cenovnikAnaliza[i].procenatKoriscenjaKolicina = eval(100*cenovnikAnaliza[i].koriscenaKolicina/ukupnoSaKolicinama);
			cenovnikAnaliza[i].skaliranProcenatKoriscenjaKolicina = 100*(cenovnikAnaliza[i].procenatKoriscenjaKolicina)/maksimum;
			csvString += cenovnikAnaliza[i].code +";"+cenovnikAnaliza[i].name+";"+cenovnikAnaliza[i].unit+";"+cenovnikAnaliza[i].price+";"+cenovnikAnaliza[i].korisceno+";"+cenovnikAnaliza[i].procenatKoriscenja+";"+cenovnikAnaliza[i].skaliranProcenatKoriscenja+";"+cenovnikAnaliza[i].procenatKoriscenjaKolicina+";"+cenovnikAnaliza[i].skaliranProcenatKoriscenjaKolicina+"\r\n";
		}
		fs.writeFileSync("analiza.csv",csvString,{encoding:"utf8"});
		console.log("wrote file");*/

		/*var nalozi = [];
		var naloziApril = await naloziDB.find({"datum.datum":{$regex:"04.2025"}}).toArray();
		for(var i=0;i<naloziApril.length;i++){
			naloziApril[i].mesec = "April 2025";
			nalozi.push(naloziApril[i])
		}
		var naloziMaj = await naloziDB.find({"datum.datum":{$regex:"05.2025"}}).toArray();
		for(var i=0;i<naloziMaj.length;i++){
			naloziMaj[i].mesec = "Maj 2025";
			nalozi.push(naloziMaj[i])
		}
		var naloziJun = await naloziDB.find({"datum.datum":{$regex:"06.2025"}}).toArray();
		for(var i=0;i<naloziJun.length;i++){
			naloziJun[i].mesec = "Jun 2025";
			nalozi.push(naloziJun[i]);
		}
		var woma	= ["80.02.09.020","80.02.09.021","80.02.09.022"];
		var rucno = ["80.02.09.001","80.02.09.002","80.02.09.003","80.02.09.004","80.02.09.005"];
		var crp   = ["80.02.09.009","80.02.09.010","80.02.09.012","80.02.09.025"];
		var kop 	= ["80.03.01.001","80.03.01.002","80.03.01.003","80.03.01.025"];
		var mas 	= ["80.03.01.019","80.03.01.020","80.03.01.025"];
		var kup 	= ["80.01.05.057","80.01.05.058","80.01.05.059","80.01.05.060","80.01.05.061","80.01.05.062","80.01.05.063","80.01.05.064"];

		for(var i=0;i<nalozi.length;i++){
			console.log(nalozi[i].mesec)
			nalozi[i].tipNaloga = "ZAMENA";
			if(parseFloat(nalozi[i].ukupanIznos)==0){
				nalozi.splice(i,1);
				i--;
			}
		}


		for(var i=0;i<nalozi.length;i++){
			if(nalozi[i].tipNaloga=="ZAMENA"){
				for(var k=0;k<nalozi[i].obracun.length;k++){
					if(kop.indexOf(nalozi[i].obracun[k].code)>=0){
						nalozi[i].tipNaloga = "KOPANJE";
					}
				}
			}
			

			if(nalozi[i].tipNaloga=="ZAMENA"){
				for(var k=0;k<nalozi[i].obracun.length;k++){
					if(woma.indexOf(nalozi[i].obracun[k].code)>=0){
						nalozi[i].tipNaloga = "WOMA";
					}
				}
			}

			

			if(nalozi[i].tipNaloga=="ZAMENA"){
				for(var k=0;k<nalozi[i].obracun.length;k++){
					if(rucno.indexOf(nalozi[i].obracun[k].code)>=0){
						if(parseFloat(nalozi[i].ukupanIznos)<20000){
							nalozi[i].tipNaloga = "SAJLA";
						}
					}
				}
			}

			

			if(nalozi[i].tipNaloga=="ZAMENA"){
				for(var k=0;k<nalozi[i].obracun.length;k++){
					if(kup.indexOf(nalozi[i].obracun[k].code)>=0){
						if(parseFloat(nalozi[i].ukupanIznos)<5500){
							//nalozi[i].tipNaloga = "SPOJKA";
						}
					}
				}
			}

			
			if(nalozi[i].tipNaloga=="ZAMENA"){
				if(nalozi[i].obracun.length==2){
					if(nalozi[i].obracun[0].code=="80.04.01.002" && nalozi[i].obracun[1].code=="80.04.01.005"){
						nalozi[i].tipNaloga = "LOKALNO";
					}else if(nalozi[i].obracun[0].code=="80.04.01.005" && nalozi[i].obracun[1].code=="80.04.01.002"){
						nalozi[i].tipNaloga = "LOKALNO";
					}
				}else if(nalozi[i].obracun.length==1){
					if(nalozi[i].obracun[0].code=="80.04.01.002" || nalozi[i].obracun[0].code=="80.04.01.005"){
						nalozi[i].tipNaloga = "LOKALNO";
					}
				}
			}
		}
		var csvString = "Broj naloga;Mesec;Radna Jedinica;Tip;Iznos\r\n";
		for(var i=0;i<nalozi.length;i++){
			csvString += nalozi[i].broj + ";"+nalozi[i].mesec+";" +nalozi[i].radnaJedinica +";"+nalozi[i].tipNaloga+";"+ nalozi[i].ukupanIznos+"\r\n"; 
		}					
		fs.writeFileSync("nalozi.csv",csvString,{encoding:"Utf8"})
		console.log("Wrote file");*/

		/*var cenovnikString = fs.readFileSync("cenovnik.csv",{encoding:"utf8"});
		var cenovnikStringArray = cenovnikString.split("\r\n");
		var cenovnikJson = [];
		for(var i=1;i<cenovnikStringArray.length;i++){
			var tempArray = smartSplitCSVLine(cenovnikStringArray[i]);
			var json = [];
			json.sifra = tempArray[0];
			json.stariNaziv = tempArray[1];
			json.noviNaziv = tempArray[2];
			json.jedinicaMere = tempArray[3];
			json.maxCena = tempArray[5];
			json.novaCena = parseFloat(tempArray[6]);
			cenovnikJson.push(json)
		}
		//console.log(cenovnikJson)
		for(var i=0;i<cenovnikJson.length;i++){
			cenovnikJson[i].cena = cenovnikJson.novaCena;
			for(var j=0;j<cenovnik.length;j++){
				if(cenovnikJson[i].sifra==cenovnik[j].code){
					cenovnikJson[i].cena = cenovnik[j].price;
				}
			}

			cenovnikJson[i].cenaVelikihPodizvodjaca = cenovnikJson.novaCena;
			for(var j=0;j<cenovnikHigh.length;j++){
				if(cenovnikJson[i].sifra==cenovnikHigh[j].code){
					cenovnikJson[i].cenaVelikihPodizvodjaca = cenovnikHigh[j].price;
				}
			}


			cenovnikJson[i].cenaNiskihPodizvodjaca = cenovnikJson.novaCena;
			for(var j=0;j<cenovnikLow.length;j++){
				if(cenovnikJson[i].sifra==cenovnikLow[j].code){
					cenovnikJson[i].cenaNiskihPodizvodjaca = cenovnikLow[j].price;
				}
			}
		}

		var csvString = "Sifra;Stari naziv;Novi Naziv;Jedinica mere;Max cena;Nova Cena;Stara Cena;Cena velikog podizvodjaca;Cena malog podizvodjaca\r\n"
		for(var i=0;i<cenovnikJson.length;i++){
			var cena = cenovnikJson[i];
			csvString += cena.sifra+";"+cena.stariNaziv+";"+cena.noviNaziv+";"+cena.jedinicaMere+";"+cena.maxCena+";"+cena.novaCena+";"+cena.cena+";"+cena.cenaVelikihPodizvodjaca+";"+cena.cenaNiskihPodizvodjaca+"\r\n";
		}
		fs.writeFileSync("cenovnikAnaliza.csv",csvString,{encoding:"utf8"})
		console.log("Wrote file");*/


		/*var nalozi = await naloziDB.find({}).toArray();
		var rucno = ["80.02.09.001","80.02.09.002","80.02.09.003","80.02.09.004","80.02.09.005"];
		var crp   = ["80.02.09.009","80.02.09.010","80.02.09.012","80.02.09.025"];
		var naloziToExport = [];
		var brojeviNaloga = [];
		for(var i=0;i<nalozi.length;i++){
			for(var j=0;j<nalozi[i].obracun.length;j++){
				if(crp.indexOf(nalozi[i].obracun[j].code)>=0){
					naloziToExport.push(nalozi[i]);
					brojeviNaloga.push(nalozi[i].broj)
				}
			}
		}
		console.log(brojeviNaloga.length)

		var counter  =	0;
		var dodele = await dodeljivaniNaloziDB.find({nalog:{$in:brojeviNaloga}}).toArray()
		for(var i=0;i<dodele.length;i++){
			if(dodele[i].majstor=="PS9fh--1692263743552"){
				counter++;
			}
		}
		console.log("Crpljenje "+counter);*/


		/*var nalozi = [];
		var naloziApril = await naloziDB.find({"datum.datum":{$regex:"04.2025"}}).toArray();
		for(var i=0;i<naloziApril.length;i++){
			naloziApril[i].mesec = "April 2025";
			nalozi.push(naloziApril[i])
		}
		var naloziMaj = await naloziDB.find({"datum.datum":{$regex:"05.2025"}}).toArray();
		for(var i=0;i<naloziMaj.length;i++){
			naloziMaj[i].mesec = "Maj 2025";
			nalozi.push(naloziMaj[i])
		}
		var naloziJun = await naloziDB.find({"datum.datum":{$regex:"06.2025"}}).toArray();
		for(var i=0;i<naloziJun.length;i++){
			naloziJun[i].mesec = "Jun 2025";
			nalozi.push(naloziJun[i]);
		}


		var naloziApril = await naloziDB.find({"datum.datum":{$regex:"04.2024"}}).toArray();
		for(var i=0;i<naloziApril.length;i++){
			naloziApril[i].mesec = "April 2024";
			nalozi.push(naloziApril[i])
		}
		var naloziMaj = await naloziDB.find({"datum.datum":{$regex:"05.2024"}}).toArray();
		for(var i=0;i<naloziMaj.length;i++){
			naloziMaj[i].mesec = "Maj 2024";
			nalozi.push(naloziMaj[i])
		}
		var naloziJun = await naloziDB.find({"datum.datum":{$regex:"06.2024"}}).toArray();
		for(var i=0;i<naloziJun.length;i++){
			naloziJun[i].mesec = "Jun 2024";
			nalozi.push(naloziJun[i]);
		};

		var woma	= ["80.02.09.020","80.02.09.021","80.02.09.022"];
		var rucno = ["80.02.09.001","80.02.09.002","80.02.09.003","80.02.09.004","80.02.09.005"];
		var crp   = ["80.02.09.009","80.02.09.010","80.02.09.012","80.02.09.025"];
		var kop 	= ["80.03.01.001","80.03.01.002","80.03.01.003","80.03.01.025"];
		var mas 	= ["80.03.01.019","80.03.01.020","80.03.01.025"];
		var kup 	= ["80.01.05.057","80.01.05.058","80.01.05.059","80.01.05.060","80.01.05.061","80.01.05.062","80.01.05.063","80.01.05.064"];

		for(var i=0;i<nalozi.length;i++){
			nalozi[i].tipNaloga = "ZAMENA";
			if(parseFloat(nalozi[i].ukupanIznos)==0){
				nalozi.splice(i,1);
				i--;
			}
		}


		for(var i=0;i<nalozi.length;i++){
			if(nalozi[i].tipNaloga=="ZAMENA"){
				for(var k=0;k<nalozi[i].obracun.length;k++){
					if(kop.indexOf(nalozi[i].obracun[k].code)>=0){
						nalozi[i].tipNaloga = "KOPANJE";
					}
				}
			}
			

			if(nalozi[i].tipNaloga=="ZAMENA"){
				for(var k=0;k<nalozi[i].obracun.length;k++){
					if(woma.indexOf(nalozi[i].obracun[k].code)>=0){
						nalozi[i].tipNaloga = "WOMA";
					}
				}
			}

			

			if(nalozi[i].tipNaloga=="ZAMENA"){
				for(var k=0;k<nalozi[i].obracun.length;k++){
					if(rucno.indexOf(nalozi[i].obracun[k].code)>=0){
						if(parseFloat(nalozi[i].ukupanIznos)<20000){
							nalozi[i].tipNaloga = "SAJLA";
						}
					}
				}
			}

			

			if(nalozi[i].tipNaloga=="ZAMENA"){
				for(var k=0;k<nalozi[i].obracun.length;k++){
					if(kup.indexOf(nalozi[i].obracun[k].code)>=0){
						if(parseFloat(nalozi[i].ukupanIznos)<5500){
							nalozi[i].tipNaloga = "SPOJKA";
						}
					}
				}
			}

			
			if(nalozi[i].tipNaloga=="ZAMENA"){
				if(nalozi[i].obracun.length==2){
					if(nalozi[i].obracun[0].code=="80.04.01.002" && nalozi[i].obracun[1].code=="80.04.01.005"){
						nalozi[i].tipNaloga = "LOKALNO";
					}else if(nalozi[i].obracun[0].code=="80.04.01.005" && nalozi[i].obracun[1].code=="80.04.01.002"){
						nalozi[i].tipNaloga = "LOKALNO";
					}
				}else if(nalozi[i].obracun.length==1){
					if(nalozi[i].obracun[0].code=="80.04.01.002" || nalozi[i].obracun[0].code=="80.04.01.005"){
						nalozi[i].tipNaloga = "LOKALNO";
					}
				}
			}
		}


		var meseci = ["April 2024","Maj 2024","Jun 2024","April 2025","Maj 2025","Jun 2025"];
		var radneJedinice = ["NOVI BEOGRAD","ZEMUN","RAKOVICA","ČUKARICA","SAVSKI VENAC","ZVEZDARA","VOŽDOVAC","VRAČAR","PALILULA","STARI GRAD"];
		var tipoviNaloga = ["ZAMENA","KOPANJE","SAJLA","LOKALNO","SPOJKA","WOMA"];
		for(var i=0;i<meseci.length;i++){
			for(var j=0;j<radneJedinice.length;j++){
				console.log(meseci[i]+" / "+radneJedinice[j])
				for(var k=0;k<tipoviNaloga.length;k++){
					var ukupanIznos = 0;
					var ukupnoNaloga = 0;
					for(var l=0;l<nalozi.length;l++){
						if(nalozi[l].mesec == meseci[i] && nalozi[l].radnaJedinica == radneJedinice[j] && nalozi[l].tipNaloga==tipoviNaloga[k]){
							ukupnoNaloga++;
							ukupanIznos = ukupanIznos + parseFloat(nalozi[l].ukupanIznos);
						}
					}
					console.log(ukupnoNaloga);
				}	
			}
		}*/


		/*var csvString = "Broj naloga;Mesec;Radna Jedinica;Tip;Iznos\r\n";
		for(var i=0;i<nalozi.length;i++){
			csvString += nalozi[i].broj + ";"+nalozi[i].mesec+";" +nalozi[i].radnaJedinica +";"+nalozi[i].tipNaloga+";"+ nalozi[i].ukupanIznos+"\r\n"; 
		}					
		fs.writeFileSync("nalozi.csv",csvString,{encoding:"Utf8"})
		console.log("Wrote file");*/

		/*var nalozi = await nalozi2023DB.find({}).toArray();
		var meseci = ["April 2023","Maj 2023","Jun 2023"];
		var radneJedinice = ["NOVI BEOGRAD","ZEMUN","RAKOVICA","ČUKARICA","SAVSKI VENAC","ZVEZDARA","VOŽDOVAC","VRAČAR","PALILULA","STARI GRAD"];
		for(var i=0;i<meseci.length;i++){
			
			for(var j=0;j<radneJedinice.length;j++){
				var ukupanIznos = 0;
				var ukupnoNaloga = 0;
				for(var k=0;k<nalozi.length;k++){
					if(nalozi[k].radnaJedinica==radneJedinice[j]){
						if(nalozi[k].radPregledan.includes("04.2023") && meseci[i]=="April 2023"){
							ukupanIznos = ukupanIznos + parseFloat(nalozi[k].ukupanIznos);
							ukupnoNaloga++;
						}else if(nalozi[k].radPregledan.includes("05.2023") && meseci[i]=="Maj 2023"){
							ukupanIznos = ukupanIznos + parseFloat(nalozi[k].ukupanIznos);
							ukupnoNaloga++;
						}else if(nalozi[k].radPregledan.includes("06.2023") && meseci[i]=="Jun 2023"){
							ukupanIznos = ukupanIznos + parseFloat(nalozi[k].ukupanIznos);
							ukupnoNaloga++;
						}
					}
				}
				console.log(meseci[i] +" / "+ radneJedinice[j]);
				console.log(ukupanIznos)
				console.log(ukupnoNaloga);
				console.log("---------------------")

			}
		}*/

		/*var nalozi = await portalStambenoTestDB.find({vrsta_promene:"STATUS",datum_izdavanja_naloga: {$regex: /^2025\-(04|05|06)/}}).toArray();
		var separated = [];
		for(var i=0;i<nalozi.length;i++){
			if(nalozi[i].status_code=="IZVRSEN"){
				nalozi[i].starttime = new Date(nalozi[i].datum_azuriranja).getTime();
				for(var j=0;j<nalozi.length;j++){
					if(nalozi[j].status_code=="FAKTURISAN" && nalozi[i].broj_naloga==nalozi[j].broj_naloga){
						nalozi[i].endtime = new Date(nalozi[j].datum_azuriranja).getTime();
						//console.log(nalozi[i].endtime)
						nalozi[i].dani = (nalozi[i].endtime - nalozi[i].starttime) / (1000 * 60 * 60 * 24);
						console.log(nalozi[i].dani)
					}
				}
			}
		}*/





	})
	.catch(error => {
		logError(error);
		console.log('Failed to connect to database');
	});
});

var daysInWeek = ["PONEDELJAK","UTORAK","SREDU","ČETVRTAK","PETAK","SUBOTU","NEDELJU"];


const sendEmail = () => {
		majstoriDB.find({uniqueId:{$nin:podizvodjaci},aktivan:true}).toArray()
		.then((majstori)=>{
			var idoviMajstora = [];
			for(var i=0;i<majstori.length;i++){
				idoviMajstora.push(majstori[i].uniqueId);
			}
			majstoriDB.find({uniqueId:{$in:podizvodjaci}}).toArray()
			.then((podizvodjaciIzvestaj)=>{
				naloziDB.find({"datum.datum":getDateAsStringForDisplay(new Date())}).toArray()
				.then((danasnjiNalozi)=>{
					var nalogaDanas = danasnjiNalozi.length;
					var idoviDanasnjihNaloga = [];
					for(var i=0;i<danasnjiNalozi.length;i++){
						idoviDanasnjihNaloga.push(danasnjiNalozi[i].broj)
					}
					var naloziPodizvodjaca = 0;
					for(var i=0;i<danasnjiNalozi.length;i++){
						if(podizvodjaci.indexOf(danasnjiNalozi[i].majstor)>=0){
							naloziPodizvodjaca++;
						}
					}
					checkInMajstoraDB.find({uniqueId:{$in:idoviMajstora},date:{$in:[new Date().getDate().toString().padStart("0",2),Number(new Date().getDate().toString().padStart("0",2))]},month:{$in:[eval(new Date().getMonth()+1).toString().padStart("0",2),Number(eval(new Date().getMonth()+1).toString().padStart("0",2))]},year:new Date().getFullYear()}).toArray()
					.then((checkInMajstora)=>{
						for(var i=0;i<majstori.length;i++){
							majstori[i].checkIn = [];
							for(var j=0;j<checkInMajstora.length;j++){
								if(majstori[i].uniqueId==checkInMajstora[j].uniqueId){
									majstori[i].checkIn.push(checkInMajstora[j]);
								}
							}
						}

						dodeljivaniNaloziDB.find({majstor:{$in:idoviMajstora},"datum.datum":getDateAsStringForDisplay(new Date())}).toArray()
						.then((dodele)=>{
							for(var i=0;i<majstori.length;i++){
								majstori[i].dodeljivaniNalozi = [];
								for(var j=0;j<dodele.length;j++){
									if(dodele[j].majstor==majstori[i].uniqueId && majstori[i].dodeljivaniNalozi.indexOf(dodele[j].nalog)<0){
										majstori[i].dodeljivaniNalozi.push(dodele[j].nalog)
									}
								}
							}

							naloziDB.find({}).toArray()
							.then((nalozi)=>{
								var fakturisanIznos = 0;
								var realizovanIznos = 0;
								for(var i=0;i<nalozi.length;i++){
									if(nalozi[i].statusNaloga=="Fakturisan"){
										fakturisanIznos = fakturisanIznos + parseFloat(nalozi[i].ukupanIznos);
									}
									realizovanIznos = realizovanIznos + parseFloat(nalozi[i].ukupanIznos);
								}
								var ukupnoDodeljenihMajstorima = [];
								var ukupnoDodeljenihMajstorimaDanas = [];
								for(var i=0;i<majstori.length;i++){
									for(var j=0;j<majstori[i].dodeljivaniNalozi.length;j++){
										if(ukupnoDodeljenihMajstorima.indexOf(majstori[i].dodeljivaniNalozi[j])<0){
											ukupnoDodeljenihMajstorima.push(majstori[i].dodeljivaniNalozi[j]);
										}
									}
								}
								for(var i=0;i<ukupnoDodeljenihMajstorima.length;i++){
									if(idoviDanasnjihNaloga.indexOf(ukupnoDodeljenihMajstorima[i])){
										ukupnoDodeljenihMajstorimaDanas.push(ukupnoDodeljenihMajstorima[i])
									}
								}
								var html = "<p style=\"font-size:20px;\"><b>DNEVNI IZVEŠTAJ ZA "+daysInWeek[(new Date().getDay() + 6) % 7]+" - "+getDateAsStringForDisplay(new Date())+"</b></p>";
								html += "<p><b>Ukupno fakturisano:</b> "+brojSaRazmacima(fakturisanIznos)+"</p>";
								html += "<p><b>Ukupno realizovano:</b> "+brojSaRazmacima(realizovanIznos)+"</p>";
								html += "<p><b>Danasnji broj naloga:</b> "+nalogaDanas+" / "+ukupnoDodeljenihMajstorimaDanas.length+"(dodeljenih)</p>";
								html += "<p><b>Dodeljeno podizvodjacima:</b> "+naloziPodizvodjaca+"</p>";
								html += "-----------------------------------------------------------------------"
								html += "<p style=\"font-size:20px;margin-bottom:10px\"><b>MAJSTORI:</b></p>"
								for(var i=0;i<majstori.length;i++){
									html += "<div style=\"margin-bottom:10px;font-size:16px\"><b>"+majstori[i].ime+"</b><br>";

									var vremeDolaska = majstori[i].checkIn.length>0 ? majstori[i].checkIn[0].timestamp : "/";
									var vremeOdlaska = majstori[i].checkIn.length>1 ? majstori[i].checkIn[majstori[i].checkIn.length-1].timestamp : "/";
									html += "<p style=\"padding-left:10px;margin:0;font-size:12px\"><b>Vreme dolaska: </b>"+vremeDolaska+"</p>"
									html += "<p style=\"padding-left:10px;margin:0;font-size:12px\"><b>Vreme odlaska: </b>"+vremeOdlaska+"</p>";
									var radnoVreme = "/";
									if(vremeDolaska!="/" && vremeOdlaska!="/"){
										var totalMiliseconds = majstori[i].checkIn[majstori[i].checkIn.length-1].datetime - majstori[i].checkIn[0].datetime;
										var totalMinutes =  Math.floor(totalMiliseconds / 60000);
										var hours = Math.floor(totalMinutes / 60);
										var minutes = totalMinutes % 60;
										radnoVreme = String(hours).padStart(2, '0') + ":" + String(minutes).padStart(2, '0');
									}
									html += "<p style=\"padding-left:10px;margin:0;font-size:12px\"><b>Radno vreme: </b>"+radnoVreme+"</p>"
									html += "<p style=\"padding-left:10px;margin:0;font-size:12px\"><b>Dodeljeno naloga: </b>"+majstori[i].dodeljivaniNalozi.length+"</p>"

	
								}
								html += "<p style=\"margin-top:20px;font-size:20px\"><b>KRAJ IZVEŠTAJA</b></p>"
								html += "</div>"
								
								const mailOptions = {
						        from: 'admin@poslovigrada.rs', // Sender address
						        to: 'miloscane@gmail.com',//,stefan.jankovic.ckp@gmail.com,marija.slijepcevic@poslovigrada.rs,doca051@gmail.com', // List of recipients
						        subject: 'Poslovi Grada - Dnevni izvestaj za '+daysInWeek[(new Date().getDay() + 6) % 7]+" - "+getDateAsStringForDisplay(new Date()),
						        html: html
						    };

						    transporter.sendMail(mailOptions, (error, info) => {
						        if (error) {
						            console.error('Error sending email:', error);
						        } else {
						            console.log('Email sent:', info.response);
						        }
						    });
							})
							.catch((error)=>{
								logError(error);
							})

							
						})
						.catch((error)=>{
							logError(error)
						})
					})
					.catch((error)=>{
						logError(error);
					})

					
				})
				.catch((error)=>{
					logError(error)
				})
			})
			.catch((error)=>{
				logError(error);
			})
		})
		.catch((error)=>{
			logError(error);
		})
    
};

const saveStops = async () => {
	var date = new Date();
	var vozila2 = JSON.parse(JSON.stringify(vozila));
	var startTime = date.toISOString().split('T')[0] + " 00:00:00";
	var endTime = date.toISOString().split('T')[0] + " 23:59:59";

	vozila2.date = getDateAsStringForInputObject(date);
	config = {
    url: baseUrl + '/api/DailySummary/GetDailySummary',
    method: 'POST', // If necessary
    headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    },
    data: { 
    	'ClientId': process.env.telematicsid, 
    	'TimeZone':'Central Standard Time',
    	'StartTime': startTime,
      'EndTime': endTime
    }
	};
	
	console.log("Waiting daily summary");

	var dailySummary = await axios(config);
	for(var i=0;i<dailySummary.data.length;i++){
		for(var j=0;j<vozila2.vozila.Data.length;j++){
			if(vozila2.vozila.Data[j].DeviceName==dailySummary.data[i].RegNo){
				vozila2.vozila.Data[j].dailySummary = dailySummary.data[i];
			}
		}
	}
	
	for(var i=0;i<vozila2.vozila.Data.length;i++){
		var config = {
      url: baseUrl + '/api/Trip/GetMileageSummary',
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
      },
      data: {
          'ImeiNumber': Number(vozila2.vozila.Data[i].ImeiNumber),
          'StartTime': startTime,
          'EndTime': endTime,
          'TimeZone': 'Central European Standard Time'
      }
    };

    const response = await axios(config);
    vozila2.vozila.Data[i].mileageSummary = response.data;
    
		await new Promise(resolve => setTimeout(resolve, 2000));

	}

	var assetIds = [];
	for(var i=0;i<vozila2.vozila.Data.length;i++){
		//console.log(vozila2.vozila.Data[i])
		assetIds.push(vozila2.vozila.Data[i].dailySummary.VehicleId)
		//assetIds.push(vozila2.vozila.Data[i].ImeiNumber)
	}

	/*console.log("ClientId:")
	console.log(vozila2.clientInfo)
	console.log("AssetIds:")
	console.log(assetIds)

	for(var i=0;i<assetIds.length;i++){
		var config = {
      url: baseUrl + '/api/fuel/AssetFuelInfo',
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
      },
      data: {
          'AssetId': assetIds[i],
          'StartDate': startTime,
          'EndDate': endTime,
          'TimeZoneID': 'Central European Standard Time'
      }
    };
    //console.log(config.data);
    const response = await axios(config);
    await new Promise(resolve => setTimeout(resolve, 2000));
    if(response.data.length>0){
    	console.log(response.data[0].refills);
    console.log("##########################REQUEST DONE##################################################")
    }
    
	}*/



	stopoviDB.insertOne(vozila2)
  .then((dbResponse)=>{
  	console.log("Wrote stops for "+date)
  })
  .catch((error)=>{
  	logError(error)
  })
};

//setTimeout(function(){saveStops();},11000)

schedule.scheduleJob('59 23 * * *', sendEmail);
schedule.scheduleJob('00 23 * * *', saveStops);


server.get('/',async (req,res)=>{
	if(req.session.user){
		if(Number(req.session.user.role)==5){
			res.redirect("/stefan/naslovna");
		}else if(Number(req.session.user.role)==10){
			res.redirect("/administracija");
		}else if(Number(req.session.user.role)==20){
			res.redirect("/dispecer/otvoreniNalozi")
		}else if(Number(req.session.user.role)==25){
			res.redirect("/kontrola/naslovna")
		}else if(Number(req.session.user.role)==30){
			res.redirect("/podizvodjac/otvoreniNalozi")
		}else if(Number(req.session.user.role)==40){
			res.redirect("/spremniNalozi")
		}else if(Number(req.session.user.role)==50){
			res.redirect("/magacioner/stanje")
		}else if(Number(req.session.user.role)==60){
			res.redirect("/majstor/mesec")
		}else{
			res.render("message",{
				pageTitle: "Грешка",
				message: "<div class=\"text\">Није дефинисан ниво корисника.</div>",
				user: req.session.user
			});
		}
	}else{
		res.redirect("/login");
	}
});
 
server.get('/administracija',async (req,res)=>{
	if(req.session.user){
		if(Number(req.session.user.role)==10){
			naloziDB.find({}).toArray()
			.then((nalozi) => {
				var ukupnoNaloga = 0;
				var ukupnoObracunataVrednostNaloga = 0;
				var ukupnoFakturisanIznos = 0;
				var ukupnoFakturisanihNaloga = 0;
				var ukupnoNefakturisanIznos = 0;
				var ukupnoNefakturisanihNaloga = 0;
				var ukupnoNezavrsenihNaloga = 0;
				var ukupnoNeobracunatihNaloga = 0;
				var ukupnoSpremnihIznos = 0;
				var ukupnoSpremnihNaloga = 0;
				var ukupnoRealizovano = 0;
				for(var i=0;i<nalozi.length;i++){
					var nalog = nalozi[i];
					ukupnoNaloga++;
					if(!isNaN(parseFloat(nalog.ukupanIznos))){
						ukupnoObracunataVrednostNaloga = ukupnoObracunataVrednostNaloga +parseFloat(nalog.ukupanIznos);
					}
					if(nalog.statusNaloga=="Fakturisan"){
						ukupnoFakturisanihNaloga++;
						ukupnoFakturisanIznos = ukupnoFakturisanIznos + parseFloat(nalog.ukupanIznos);
					}else if(nalog.statusNaloga=="Završeno" || nalog.statusNaloga=="Spreman za fakturisanje" || nalog.statusNaloga=="Nalog u Stambenom"){
						ukupnoNefakturisanihNaloga++;
						if(!isNaN(parseFloat(nalog.ukupanIznos))){
							ukupnoNefakturisanIznos = ukupnoNefakturisanIznos + parseFloat(nalog.ukupanIznos);
						}
						
					}

					if(nalog.statusNaloga=="Spreman za fakturisanje"){
						if(!isNaN(parseFloat(nalog.ukupanIznos))){
							ukupnoSpremnihIznos = ukupnoSpremnihIznos + parseFloat(nalog.ukupanIznos);
						}
						ukupnoSpremnihNaloga++;
					}

					if(nalog.statusNaloga != "Završeno" && nalog.statusNaloga != "Fakturisan" && nalog.statusNaloga != "Spreman za fakturisanje"){
						ukupnoNezavrsenihNaloga++;
					}

					if(parseFloat(nalog.ukupanIznos)==0 || isNaN(parseFloat(nalog.ukupanIznos))){
						ukupnoNeobracunatihNaloga++;
					}
				}

				var informacijeJson = {};
				informacijeJson.ukupnoNaloga = ukupnoNaloga;
				informacijeJson.ukupnoObracunataVrednostNaloga = ukupnoObracunataVrednostNaloga;
				informacijeJson.ukupnoFakturisanIznos = ukupnoFakturisanIznos;
				informacijeJson.ukupnoFakturisanihNaloga = ukupnoFakturisanihNaloga;
				informacijeJson.ukupnoNefakturisanIznos = ukupnoNefakturisanIznos;
				informacijeJson.ukupnoNefakturisanihNaloga = ukupnoNefakturisanihNaloga;
				informacijeJson.ukupnoNezavrsenihNaloga = ukupnoNezavrsenihNaloga;
				informacijeJson.ukupnoNeobracunatihNaloga = ukupnoNeobracunatihNaloga;
				informacijeJson.ukupnoSpremnihIznos = ukupnoSpremnihIznos;
				informacijeJson.ukupnoSpremnihNaloga = ukupnoSpremnihNaloga;
				informacijeJson.ukupnoRealizovano = ukupnoSpremnihIznos + ukupnoFakturisanIznos;
				res.render("administracija/administracija",{
					pageTitle:"Насловна",
					user: req.session.user,
					informacije: informacijeJson
				})
			})
			.catch((error)=>{
				logError(error);
				res.render("message",{
					pageTitle: "Програмска грешка",
					message: "<div class=\"text\">Дошло је до грешке у бази податка 116.</div>"
				});
			});
		}else{
			res.render("message",{
				pageTitle: "Програмска грешка",
				message: "<div class=\"text\">Дошло је до грешке у бази податка 116.</div>"
			});
		}
	}else{

	}
});

server.get('/administracija2',async (req,res)=>{
	if(req.session.user){
		if(Number(req.session.user.role)==10){
			res.render("administracija/administracija2",{
				pageTitle: "Статистика фирме",
				user:req.session.user
			});
		}else{
			res.render("message",{
				pageTitle: "Greska",
				user:req.session.user,
				message: "<div class=\"text\">Vas nalog nije ovlascen da vidi ovu stranicu.</div>"
			});
		}
	}else{
		res.redirect("/login?url="+encodeURIComponent(req.url));
	}
});


/*server.get("/sastanak",async(req,res)=>{
	naloziDB.find({majstor:{$nin:podizvodjaci},"datum.datum":{$regex:"03.2025"}}).sort({ "datum.datetime": 1 }).toArray()
	.then((nalozi)=>{
		var nalogIds = [];
		for(var i=0;i<nalozi.length;i++){
			nalogIds.push(nalozi[i].broj);
		}
		dodeljivaniNaloziDB.find({"datum.datum":{$regex:"03.2025"},deleted:{$exists:false}}).toArray()
		.then((dodele)=>{
			majstoriDB.find({uniqueId:{$nin:podizvodjaci}}).toArray()
			.then((majstori)=>{
				istorijaNalogaDB.find({broj:{$in:nalogIds}}).sort({ datetime: 1 }).toArray()
				.then((istorijatNaloga)=>{
					for(var i=0;i<nalozi.length;i++){
						nalozi[i].istorija = [];
						for(var j=0;j<istorijatNaloga.length;j++){
							if(nalozi[i].broj==istorijatNaloga[j].broj){
								nalozi[i].istorija.push(istorijatNaloga[j]);
							}
						}
					}
					res.render("sastanak",{
						pageTitle: "Састанак",
						nalozi: nalozi,
						dodele: dodele,
						majstori: majstori
					})
				})
			})
			.catch((error)=>{
				console.log(error)
			})
		})
		.catch((error)=>{
			console.log(error)
		})
	})
	.catch((error)=>{
		console.log(error)
	})
})*/


server.post('/obrisiPotrebnaFinalizacija',async (req,res)=>{
	if(req.session.user){
		if(Number(req.session.user.role)==10){
			var setObj	=	{ $set: {
				statusFin: "Gotovo"
			}};
			izvestajiDB.updateOne({nalog:req.body.brojnaloga.toString(),izvestaj:{$regex:"POTREBNA FINALIZACIJA ILI"},statusFin:{$ne:"Gotovo"}},setObj)
			.then((dbResponse)=>{
				res.redirect("/administracija/potrebnaFinalizacija")
			})
			.catch((error)=>{
				logError(error);
				res.render("message",{
					pageTitle: "Програмска грешка",
					message: "<div class=\"text\">Дошло је до грешке у бази податка 1849.</div>"
				});
			})
		}else{
			res.render("message",{
				pageTitle: "Грешка",
				message: "<div class=\"text\">Ваш налог није овлашћен да ради ово.</div>"
			});
		}
	}else{
		res.redirect("/login?url="+encodeURIComponent(req.url));
	}
})
 
server.get('/administracija/potrebnaFinalizacija',async (req,res)=>{
	if(req.session.user){
		if(Number(req.session.user.role)==10){
			izvestajiDB.find({izvestaj:{$regex:"POTREBNA FINALIZACIJA ILI"},statusFin:{$ne:"Gotovo"}}).toArray()
			.then((izvestaji)=>{
				var brojeviNaloga = [];
				for(var i=0;i<izvestaji.length;i++){
					brojeviNaloga.push(izvestaji[i].nalog);
				}
				naloziDB.find({broj:{$in:brojeviNaloga}}).toArray()
				.then((nalozi)=>{
					res.render("administracija/potrebnaFinalizacija",{
						pageTitle:"За Финализацију или копање",
						nalozi: nalozi,
						user: req.session.user
					})
				})
				.catch((error)=>{
					logError(error);
					res.render("message",{
						pageTitle: "Програмска грешка",
						message: "<div class=\"text\">Дошло је до грешке у бази податка 1841.</div>"
					});
				})
			})
			.catch((error)=>{
				logError(error);
				res.render("message",{
					pageTitle: "Програмска грешка",
					message: "<div class=\"text\">Дошло је до грешке у бази податка 1849.</div>"
				});
			})
		}else{
			res.render("message",{
				pageTitle: "Грешка",
				message: "<div class=\"text\">Ваш налог није овлашћен да види ову страницу.</div>"
			});
		}
	}else{
		res.redirect("/login?url="+encodeURIComponent(req.url));
	}
})

server.get('/login',async (req,res)=>{
	if(req.session.user){
		res.redirect("/")
	}else{
		if(req.query.url){
			res.render("login",{
				pageTitle: "Пријављивање",
				url:	decodeURIComponent(req.query.url)
			});
		}else{
			res.render("login",{
				pageTitle: "Пријављивање"
			});
		}
		
	}
});

server.post('/login',async (req,res)=>{
	if(req.session.user){
		res.redirect("/")
	}else{
		const loginJson = JSON.parse(req.body.json)
		const username = loginJson.username;
		const password = hashString(loginJson.password);
		usersDB.find({email:username}).toArray()
		.then((korisnici) => {
			if(korisnici.length>0){
				if(korisnici[0].password==password){
					var sessionObject	=	JSON.parse(JSON.stringify(korisnici[0]));
					if(Number(sessionObject.role)==10){
						sessionObject.opstine = radneJedinice;
					}
					delete sessionObject.password;
					req.session.user	=	sessionObject;
					if(loginJson.url){
						res.redirect(loginJson.url);
					}else{
						res.redirect('/');
					}
				}else{
					res.render("messageNotLoggedIn",{
						pageTitle: "Грешка",
						message: "<div class=\"text\">Унели сте погрешну лозинку.</div><div class=\"button\"><a href=\"/login\" onclick=\"loadGif()\">Покушај поново</a></div>"
					});
				}
			}else{
				majstoriDB.find({username:username}).toArray()
				.then((majstori)=>{
					if(majstori.length>0){
						if(majstori[0].password==password){
							var sessionObject	=	JSON.parse(JSON.stringify(majstori[0]));
							delete sessionObject.password;
							req.session.user	=	sessionObject;
							req.session.user.role = 60;
							req.session.user.name = req.session.user.ime;
							if(loginJson.url){
								res.redirect(loginJson.url);
							}else{
								res.redirect('/');
							}
						}else{
							res.render("messageNotLoggedIn",{
								pageTitle: "Грешка",
								message: "<div class=\"text\">Унели сте погрешну лозинку.</div><div class=\"button\"><a href=\"/login\" onclick=\"loadGif()\">Покушај поново</a></div>"
							});
						}
					}else{
						res.render("messageNotLoggedIn",{
							pageTitle: "Грешка",
							message: "<div class=\"text\">Не постоји корисник са унетом електронском поштом.</div><div class=\"button\"><a href=\"/login\" onclick=\"loadGif()\">Покушај поново</a></div>"
						});
					}
				})
				.catch((error)=>{
					logError(error);
					res.render("messageNotLoggedIn",{
						pageTitle: "Програмска грешка",
						message: "<div class=\"text\">Дошло је до грешке у бази податка 2263.</div><div class=\"button\"><a href=\"/login\" onclick=\"loadGif()\">Покушај поново</a></div>"
					});
				})
			}
		})
		.catch(error => {
			logError(error)
			res.render("messageNotLoggedIn",{
				pageTitle: "Програмска грешка",
				message: "<div class=\"text\">Дошло је до грешке у бази податка 147.</div><div class=\"button\"><a href=\"/login\" onclick=\"loadGif()\">Покушај поново</a></div>"
			});
		})
	}
});

server.get('/logout',async (req,res)=>{
	if(req.session){
		req.session.destroy(function(){});
	}
	res.redirect('/login');
});

server.get('/zaboravljena-lozinka',async (req,res)=>{
	if(req.session.user){
		res.redirect("/")
	}else{
		res.render("zaboravljenaLozinka",{
			pageTitle: "Поновно постављање лозинке"
		});
	}
});

server.post('/zaboravljena-lozinka',async (req,res)=>{
	if(req.session.user){
		res.redirect("/")
	}else{
		const loginJson = JSON.parse(req.body.json)
		const username = loginJson.username;
		usersDB.find({email:username}).toArray()
		.then((korisnici) => {
			if(korisnici.length>0){
				var resetId = generateId(50);
				var date = getDateAsStringForInputObject(new Date());
				var datetime = new Date().getTime();
				var setObj	=	{ $set: {
					resetPassDate: date,
					resetPassTime: datetime,
					resetPassId: resetId
				}};
				usersDB.updateOne({email:username},setObj)
				.then((dbResponse) => {
					var mailOptions = {
						from: '"ВиК Портал Послова Града" <admin@poslovigrada.rs>',
						to: username,
						subject: 'Ресетовање лозинке за портал',
						html: 'Како бисте поставили нову лозинку отворите следећи линк <a href="'+process.env.siteurl+'/reset-lozinke/'+resetId+'">'+process.env.siteurl+'/reset-lozinke/'+resetId+'</a>.Линк је валидан само 30 минута.<br>&nbsp;<br>Уколико не препознајете ову активност игноришите ову поруку.'+mailPotpis
					};
						
					transporter.sendMail(mailOptions, (error, info) => {
						if (error) {
							logError(error);
							res.render("messageNotLoggedIn",{
								pageTitle: "Грешка",
								message: "<div class=\"text\">Дошло је до грешке приликом слања поруке.</div><div class=\"button\"><a href=\"/zaboravljena-lozinka\" onclick=\"loadGif()\">Покушај поново</a></div>"
							});
						}else{
							res.render("messageNotLoggedIn",{
								pageTitle: "Обавештење",
								message: "<div class=\"text\">Успешно послат линк за ресетовање лозинке на адресу "+username+", након промене лозинке покушајте да се улогујете. Линк је валидан само 30 минута.</div><div class=\"button\"><a href=\"/login\" onclick=\"loadGif()\">Улогуј се</a></div>"
							});
						}
					});
				})
				.catch(error=>{
					logError(error);
					res.render("messageNotLoggedIn",{
						pageTitle: "Програмска грешка",
						message: "<div class=\"text\">Дошло је до грешке у бази податка 194.</div><div class=\"button\"><a href=\"/zaboravljena-lozinka\" onclick=\"loadGif()\">Покушај поново</a></div>"
					});
				})
				
			}else{
				res.render("messageNotLoggedIn",{
					pageTitle: "Грешка",
					message: "<div class=\"text\">Не постоји корисник са унетом електронском поштом.</div><div class=\"button\"><a href=\"/zaboravljena-lozinka\" onclick=\"loadGif()\">Покушај поново</a></div>"
				});
			}
		})
		.catch(error => {
			logError(error)
			res.render("messageNotLoggedIn",{
				pageTitle: "Програмска грешка",
				message: "<div class=\"text\">Дошло је до грешке у бази податка 189.</div><div class=\"button\"><a href=\"/zaboravljena-lozinka\" onclick=\"loadGif()\">Покушај поново</a></div>"
			});
		})
	}
});

server.get('/reset-lozinke/:resetId',async (req,res)=>{
	if(req.session.user){
		res.redirect("/")
	}else{
		usersDB.find({resetPassId:req.params.resetId}).toArray()
		.then((korisnici) => {
			if(korisnici.length>0){
				var korisnikJson = JSON.parse(JSON.stringify(korisnici[0]));
				if(new Date().getTime()-Number(korisnikJson.resetPassTime)<=resetPassLimit){
					res.render("resetovanjeLozinke",{
						pageTitle: "Ресетовање лозинке",
						resetId: req.params.resetId
					});
				}else{
					res.render("messageNotLoggedIn",{
						pageTitle: "Грешка",
						message: "<div class=\"text\">Линк за ресетовање лозинке је истекао.</div><div class=\"button\"><a href=\"/zaboravljena-lozinka\" onclick=\"loadGif()\">Ресетуј лозинку поново</a></div>"
					});
				}
			}else{
				res.render("messageNotLoggedIn",{
					pageTitle: "Грешка",
					message: "<div class=\"text\">Неважећи линк за ресетовање лозинке</div><div class=\"button\"><a href=\"/zaboravljena-lozinka\" onclick=\"loadGif()\">Улогуј се</a></div>"
				});
			}
		})
		.catch(error => {
			logError(error);
			res.render("messageNotLoggedIn",{
				pageTitle: "Програмска грешка",
				message: "<div class=\"text\">Дошло је до грешке у бази податка 273.</div><div class=\"button\"><a href=\"/login\" onclick=\"loadGif()\">Покушај поново</a></div>"
			});
		})
	}
});

server.post('/reset-lozinke',async (req,res)=>{
	if(req.session.user){
		res.redirect("/")
	}else{
		var formJson = JSON.parse(req.body.json);
		usersDB.find({resetPassId:formJson.resetId}).toArray()
		.then((korisnici) => {
			if(korisnici.length>0){
				var korisnikJson = JSON.parse(JSON.stringify(korisnici[0]));
				if(new Date().getTime()-Number(korisnikJson.resetPassTime)<=resetPassLimit){
					if(formJson.password == formJson.password2){
						var newPassword = formJson.password;
						if(newPassword!=newPassword.toLowerCase() && newPassword.length<12 && /\d/.test(newPassword)){
							var setObj	=	{ $set: {
								resetPassDate: "",
								resetPassTime: "",
								resetPassId: "",
								password: hashString(newPassword)
							}};
							usersDB.updateOne({resetPassId:formJson.resetId},setObj)
							.then((korisnici) => {
								res.render("messageNotLoggedIn",{
									pageTitle: "Обавештење",
									message: "<div class=\"text\">Лозинка успешно промењена.</div><div class=\"button\"><a href=\"/login\" onclick=\"loadGif()\">Улогуј се</a></div>"
								});
							})
							.catch(error=>{
								logError(error);
								res.render("messageNotLoggedIn",{
									pageTitle: "Програмска грешка",
									message: "<div class=\"text\">Дошло је до грешке у бази податка 293.</div><div class=\"button\"><a href=\"/zaboravljena-lozinka\" onclick=\"loadGif()\">Покушај поново</a></div>"
								});
							})
						}else{
							//Nema veliko slovo i nije dovoljno dugacka i nema broj
							res.render("messageNotLoggedIn",{
								pageTitle: "Грешка",
								message: "<div class=\"text\">Лозинке није довољно сигурна.</div><div class=\"button\"><a href=\"/reset-lozinke/"+formJson.resetId+"\" onclick=\"loadGif()\">Ресетуј лозинку поново</a></div>"
							});
						}
					}else{
						res.render("messageNotLoggedIn",{
							pageTitle: "Грешка",
							message: "<div class=\"text\">Лозинке се не подударају.</div><div class=\"button\"><a href=\"/zaboravljena-lozinka\" onclick=\"loadGif()\">Ресетуј лозинку поново</a></div>"
						});
					}
				}else{
					res.render("messageNotLoggedIn",{
						pageTitle: "Грешка",
						message: "<div class=\"text\">Линк за ресетовање лозинке је истекао.</div><div class=\"button\"><a href=\"/zaboravljena-lozinka\" onclick=\"loadGif()\">Ресетуј лозинку поново</a></div>"
					});
				}
			}else{
				res.render("messageNotLoggedIn",{
					pageTitle: "Грешка",
					message: "<div class=\"text\">Неважећи линк за ресетовање лозинке</div><div class=\"button\"><a href=\"/zaboravljena-lozinka\" onclick=\"loadGif()\">Улогуј се</a></div>"
				});
			}
		})
		.catch(error => {
			logError(error);
			res.render("messageNotLoggedIn",{
				pageTitle: "Програмска грешка",
				message: "<div class=\"text\">Дошло је до грешке у бази податка 273.</div><div class=\"button\"><a href=\"/login\" onclick=\"loadGif()\">Покушај поново</a></div>"
			});
		})
	}
});

server.get('/stefan/naslovna',async (req,res)=>{
	if(req.session.user){
		if(Number(req.session.user.role)==5){
			naloziDB.find({}).toArray()
			.then((nalozi)=>{
				var informacije = {};
				informacije.realizovano = 0;
				informacije.realizovaniNalozi = 0;
				informacije.neobracunato = 0;
				informacije.nezavrsxeno = 0;
				informacije.fakturisano = {};
				informacije.fakturisano.iznos = 0;
				informacije.fakturisano.nalozi = 0;
				informacije.cekanje = {};
				informacije.cekanje.iznos = 0;
				informacije.cekanje.nalozi = 0;
				informacije.trenutni = {};
				informacije.trenutni.mesec = "";
				informacije.trenutni.godina = "";
				informacije.trenutni.iznos = 0;
				informacije.trenutni.nalozi = 0;
				informacije.trenutni.oporezivo = 0;
				informacije.trenutni.neoporezivo = 0;
				informacije.trenutni.pdv = 0;
				informacije.trenutni.fakturisano = {};
				informacije.trenutni.fakturisano.iznos = 0;
				informacije.trenutni.fakturisano.nalozi = 0;
				informacije.prethodni = {};
				informacije.prethodni.mesec = "";
				informacije.prethodni.godina = "";
				informacije.prethodni.iznos = 0;
				informacije.prethodni.nalozi = 0;
				informacije.prethodni.oporezivo = 0;
				informacije.prethodni.neoporezivo = 0;
				informacije.prethodni.pdv = 0;
				informacije.prethodni.fakturisano = {};
				informacije.prethodni.fakturisano.iznos = 0;
				informacije.prethodni.fakturisano.nalozi = 0;
				for(var i=0;i<nalozi.length;i++){
					//Ukupna statistika
					var iznosNaloga = isNaN(parseFloat(nalozi[i].ukupanIznos)) ? 0 : parseFloat(nalozi[i].ukupanIznos);
					informacije.realizovano = informacije.realizovano + iznosNaloga;
					var zavrseniStatusi = ["Završeno","Nalog u Stambenom","Spreman za fakturisanje","Fakturisan","Storniran","Storniran na SEF-u"];
					
					if(iznosNaloga>0){
						informacije.realizovaniNalozi++;
					}else{
						if(zavrseniStatusi.indexOf(nalozi[i].statusNaloga)>=0){
							informacije.neobracunato++;
						}
					}

					if(zavrseniStatusi.indexOf(nalozi[i].statusNaloga)<0){
						informacije.nezavrseno++;
					}

					if(nalozi[i].statusNaloga == "Fakturisan"){
						informacije.fakturisano.iznos = informacije.fakturisano.iznos + iznosNaloga;
						informacije.fakturisano.nalozi++;
					}

					var cekanjeStatus = ["Završeno","Nalog u Stambenom","Spreman za fakturisanje"];
					if(cekanjeStatus.indexOf(nalozi[i].statusNaloga)>=0){
						informacije.cekanje.iznos = informacije.cekanje.iznos + iznosNaloga;
						informacije.cekanje.nalozi++;
					}

					//Ovomesecna
					var today = new Date();
					var currentMonth = today.getMonth()+1;
					var month = currentMonth.toString().length==1 ? "0"+currentMonth : currentMonth;
					var year = today.getFullYear();
					var monthString = month+"."+year;
					informacije.trenutni.mesec = month;
					informacije.trenutni.godina = year;

					if(nalozi[i].prijemnica.datum.datum.includes(monthString)){
						informacije.trenutni.iznos = informacije.trenutni.iznos + iznosNaloga;
						informacije.trenutni.nalozi++;
						if(iznosNaloga>=500000){
							informacije.trenutni.neoporezivo = informacije.trenutni.neoporezivo + iznosNaloga;
						}else{
							informacije.trenutni.oporezivo = informacije.trenutni.oporezivo + iznosNaloga;
						}

						if(nalozi[i].statusNaloga=="Fakturisan"){
							informacije.trenutni.fakturisano.iznos = informacije.trenutni.fakturisano.iznos + iznosNaloga;
							informacije.trenutni.fakturisano.nalozi++;
						}
					}

					//prosli mesecna
					today.setMonth(today.getMonth() - 1);
					var currentMonth = today.getMonth()+1;
					var month = currentMonth.toString().length==1 ? "0"+currentMonth : currentMonth;
					var year = today.getFullYear();
					var monthString = month+"."+year;
					informacije.prethodni.mesec = month;
					informacije.prethodni.godina = year;

					if(nalozi[i].prijemnica.datum.datum.includes(monthString)){
						informacije.prethodni.iznos = informacije.prethodni.iznos + iznosNaloga;
						informacije.prethodni.nalozi++;
						if(iznosNaloga>=500000){
							informacije.prethodni.neoporezivo = informacije.prethodni.neoporezivo + iznosNaloga;
						}else{
							informacije.prethodni.oporezivo = informacije.prethodni.oporezivo + iznosNaloga;
						}

						if(nalozi[i].statusNaloga=="Fakturisan"){
							informacije.prethodni.fakturisano.iznos = informacije.prethodni.fakturisano.iznos + iznosNaloga;
							informacije.prethodni.fakturisano.nalozi++;
						}
					}

				}
				informacije.trenutni.pdv = informacije.trenutni.oporezivo*0.2;
				informacije.prethodni.pdv = informacije.prethodni.oporezivo*0.2;
				res.render("stefan/naslovna",{
					pageTitle:"Насловна",
					informacije: informacije,
					user: req.session.user
				});
			})
			.catch((error)=>{
				logError(error);
				res.render("message",{
					pageTitle: "Програмска грешка",
					user: req.session.user,
					message: "<div class=\"text\">Дошло је до грешке у бази података 1484.</div>"
				});
			})
		}else{
			res.render("message",{
				pageTitle: "Грешка",
				user: req.session.user,
				message: "<div class=\"text\">Ваш налог није овлашћен да види ову страницу.</div>"
			});
		}
	}else{
		res.redirect("/login?url="+encodeURIComponent(req.url));
	}
});

server.get('/stefan/kategorije',async (req,res)=>{
	if(req.session.user){
		if(Number(req.session.user.role)==5){
			naloziDB.find({}).toArray()
			.then((nalozi)=>{
				var meseci = [{broj:"02.2024",ime:"Februar 2024",kategorije:[]},{broj:"03.2024",ime:"Mart 2024",kategorije:[]},{broj:"04.2024",ime:"April 2024",kategorije:[]},{broj:"05.2024",ime:"Maj 2024",kategorije:[]}]
				var kategorije = ["Zamena","Sajla","Woma","Cprljenje","Kopanje","Rov","Betoniranje","Nekategorisano"]
				var informacije = {};
				for(var i=0;i<kategorije.length;i++){
					for(var j=0;j<meseci.length;j++){
						meseci[j].kategorije.push({kategorija:kategorije[i],iznos:0,ukupnoNaloga:0});
					}
				}


				for(var i=0;i<nalozi.length;i++){
					var iznosNaloga = isNaN(parseFloat(nalozi[i].ukupanIznos)) ? 0 : parseFloat(nalozi[i].ukupanIznos);
					if(nalozi[i].prijemnica.datum.datum!=""){
						if(podizvodjaci.indexOf(nalozi[i].majstor)<0){
							var mesecIndex = -1;
							for(var j=0;j<meseci.length;j++){
								if(nalozi[i].prijemnica.datum.datum.includes(meseci[j].broj)){
									mesecIndex = j;
								}
							}

							if(nalozi[i].kategorijeRadova.length>0 && mesecIndex>=0){
								for(var j=0;j<nalozi[i].kategorijeRadova.length;j++){
									for(var k=0;k<meseci[mesecIndex].kategorije.length;k++){
										if(meseci[mesecIndex].kategorije[k].kategorija==nalozi[i].kategorijeRadova[j]){
											meseci[mesecIndex].kategorije[k].iznos = meseci[mesecIndex].kategorije[k].iznos + iznosNaloga;
											meseci[mesecIndex].kategorije[k].ukupnoNaloga++;
										}
									}
								}
							}else{
								//nekategorisan
								for(var k=0;k<meseci[mesecIndex].kategorije.length;k++){
									if(meseci[mesecIndex].kategorije[k].kategorija=="Nekategorisano"){
										meseci[mesecIndex].kategorije[k].iznos = meseci[mesecIndex].kategorije[k].iznos + iznosNaloga;
										meseci[mesecIndex].kategorije[k].ukupnoNaloga++;
									}
								}
							}
						}
					}
				}
				
				res.render("stefan/kategorije",{
					pageTitle:"Категорије радова",
					meseci: meseci,
					user: req.session.user
				});
			})
			.catch((error)=>{
				logError(error);
				res.render("message",{
					pageTitle: "Програмска грешка",
					user: req.session.user,
					message: "<div class=\"text\">Дошло је до грешке у бази података 1484.</div>"
				});
			})
		}else{
			res.render("message",{
				pageTitle: "Грешка",
				user: req.session.user,
				message: "<div class=\"text\">Ваш налог није овлашћен да види ову страницу.</div>"
			});
		}
	}else{
		res.redirect("/login?url="+encodeURIComponent(req.url));
	}
});

server.get('/kontrola/naslovna',async (req,res)=>{
	if(req.session.user){
		if(Number(req.session.user.role)==25){
			try{
				var today = new Date();
				var nalozi = await naloziDB.find({majstor:{$nin:podizvodjaci},statusNaloga:{$nin:["Nalog u Stambenom","Završeno","Storniran","Spreman za fakturisanje","Fakturisan","Vraćen"]},radnaJedinica:{$in:req.session.user.radneJedinice}}).toArray();
				var nalozi2024 = await nalozi2024DB.find({majstor:{$nin:podizvodjaci},statusNaloga:{$nin:["Nalog u Stambenom","Završeno","Storniran","Spreman za fakturisanje","Fakturisan","Vraćen"]},radnaJedinica:{$in:req.session.user.radneJedinice}}).toArray();
				for(var i=0;i<nalozi2024.length;i++){
					nalozi.push(nalozi2024[i]);
				}

				var obracunatiNalozi = await naloziDB.find({majstor:{$nin:podizvodjaci},"prijemnica.datum.datum":{$regex:eval(today.getMonth()+1).toString().padStart(2,"0")+"."+today.getFullYear()},radnaJedinica:{$in:req.session.user.radneJedinice}}).toArray();
				var obracunatiNalozi2024 = await nalozi2024DB.find({majstor:{$nin:podizvodjaci},"prijemnica.datum.datum":{$regex:eval(today.getMonth()+1).toString().padStart(2,"0")+"."+today.getFullYear()},radnaJedinica:{$in:req.session.user.radneJedinice}}).toArray();
				for(var i=0;i<obracunatiNalozi2024.length;i++){
					obracunatiNalozi.push(obracunatiNalozi2024[i]);
				}
				res.render("kontrola/neizvrseniNalozi",{
					pageTitle:"Неизвршени налози на дан "+getDateAsStringForDisplay(today),
					nalozi: nalozi,
					obracunatiNalozi: obracunatiNalozi,
					user: req.session.user
				});
			}catch(error){
				logError(error)
				res.render("message",{
					pageTitle: "Грешка",
					user: req.session.user,
					message: "<div class=\"text\">Грешка у бази података 2517.</div>"
				});
			}
		}else{
			res.render("message",{
				pageTitle: "Грешка",
				user: req.session.user,
				message: "<div class=\"text\">Ваш налог није овлашћен да види ову страницу.</div>"
			});
		}
	}else{
		res.redirect("/login?url="+encodeURIComponent(req.url));
	}
});

server.get('/kontrola/radnici',async (req,res)=>{
	if(req.session.user){
		if(Number(req.session.user.role)==25){
			var radnici = [];
			majstoriDB.find({odgovornoLice:req.session.user.email}).toArray()
			.then((majstori)=>{
				for(var i=0;i<majstori.length;i++){
					radnici.push(majstori[i])
				}
				pomocniciDB.find({odgovornoLice:req.session.user.email}).toArray()
				.then((pomocnici)=>{
					for(var i=0;i<pomocnici.length;i++){
						radnici.push(pomocnici[i])
					}
					usersDB.find({odgovornoLice:req.session.user.email}).toArray()
					.then((users)=>{
						for(var i=0;i<users.length;i++){
							radnici.push(users[i]);
						}
						var ids = [];
						for(var i=0;i<radnici.length;i++){
							if(radnici[i].uniqueId){
								ids.push(radnici[i].uniqueId)
							}else{
								ids.push(radnici[i].email)
							}
						}
						checkInMajstoraDB.find({uniqueId:{$in:ids},month:{$in:[eval(new Date().getMonth()+1).toString().padStart(2,"0"),eval(new Date().getMonth()+1)]},date:{$in:[new Date().getDate().toString().padStart(2,"0"),new Date().getDate()]},year:new Date().getFullYear()}).toArray()
						.then((checkIns)=>{
							res.render("kontrola/radnici",{
								pageTitle: "Моји радници",
								user: req.session.user,
								radnici: radnici,
								checkIns: checkIns
							});
						})
						.catch((error)=>{
							logError(error)
							res.render("message",{
								pageTitle: "Грешка",
								user: req.session.user,
								message: "<div class=\"text\">Грешка у бази података 2453.</div>"
							});
						})
						
					})
					.catch((error)=>{
						logError(error)
						res.render("message",{
							pageTitle: "Грешка",
							user: req.session.user,
							message: "<div class=\"text\">Грешка у бази података 2453.</div>"
						});
					})
				})
				.catch((error)=>{
					logError(error)
					res.render("message",{
						pageTitle: "Грешка",
						user: req.session.user,
						message: "<div class=\"text\">Грешка у бази података 2453.</div>"
					});
				})
			})
			.catch((error)=>{
				logError(error)
				res.render("message",{
					pageTitle: "Грешка",
					user: req.session.user,
					message: "<div class=\"text\">Грешка у бази података 2453.</div>"
				});
			})
		}else{
			res.render("message",{
				pageTitle: "Грешка",
				user: req.session.user,
				message: "<div class=\"text\">Ваш налог није овлашћен да види ову страницу.</div>"
			});
		}
	}else{
		res.redirect("/login?url="+encodeURIComponent(req.url));
	}
});

server.get('/kontrola/opomena/:id',async (req,res)=>{
	if(req.session.user){
		if(Number(req.session.user.role)==25){
			majstoriDB.find({uniqueId:req.params.id}).toArray()
			.then((majstori)=>{
				pomocniciDB.find({uniqueId:req.params.id}).toArray()
				.then((pomocnici)=>{
					usersDB.find({email:req.params.id}).toArray()
					.then((users)=>{
						var radnik = majstori.length>0 ? majstori[0] : pomocnici.length>0 ? pomocnici[0] : users.length>0 ? users[0] : false;
						if(radnik!=false){
							opomeneDB.find({uniqueId:req.params.id,month:eval(new Date().getMonth()+1).toString().padStart(2,"0"),date:new Date().getDate().toString().padStart(2,"0"),year:new Date().getFullYear()}).toArray()
							.then((opomene)=>{
								checkInMajstoraDB.find({uniqueId:req.params.id,month:{$in:[eval(new Date().getMonth()+1).toString().padStart(2,"0"),eval(new Date().getMonth()+1)]},date:{$in:[new Date().getDate().toString().padStart(2,"0"),new Date().getDate()]},year:new Date().getFullYear()}).toArray()
								.then((checkIns)=>{
									res.render("kontrola/opomena",{
										pageTitle: "Напомена за дан: "+getDateAsStringForDisplay(new Date()) + " | "+ daniUNedelji[new Date().getDay()],
										user: req.session.user,
										radnik: radnik,
										opomene: opomene,
										checkIns: checkIns
									})
								})
								.catch((error)=>{
									logError(error);
									res.render("message",{
										pageTitle: "Грешка",
										user: req.session.user,
										message: "<div class=\"text\">Грешка у бази података 2515.</div>"
									});
								})
								
							})
							.catch((error)=>{
								logError(error);
								res.render("message",{
									pageTitle: "Грешка",
									user: req.session.user,
									message: "<div class=\"text\">Грешка у бази података 2515.</div>"
								});
							})
							
						}else{
							res.render("message",{
								pageTitle: "Грешка",
								user: req.session.user,
								message: "<div class=\"text\">Непостојећи радник.</div>"
							});
						}
						
					})
					.catch((error)=>{
						logError(error);
						res.render("message",{
							pageTitle: "Грешка",
							user: req.session.user,
							message: "<div class=\"text\">Грешка у бази података 2515.</div>"
						});
					})
				})
				.catch((error)=>{
					logError(error);
					res.render("message",{
						pageTitle: "Грешка",
						user: req.session.user,
						message: "<div class=\"text\">Грешка у бази података 2515.</div>"
					});
				})
			})
			.catch((error)=>{
				logError(error);
				res.render("message",{
					pageTitle: "Грешка",
					user: req.session.user,
					message: "<div class=\"text\">Грешка у бази података 2515.</div>"
				});
			})
		}else{
			res.render("message",{
				pageTitle: "Грешка",
				user: req.session.user,
				message: "<div class=\"text\">Ваш налог није овлашћен да види ову страницу.</div>"
			});
		}
	}else{
		res.redirect("/login?url="+encodeURIComponent(req.url));
	}
});

server.post('/opomenaRadnika', async (req, res)=> {
	if(req.session.user){
		if(Number(req.session.user.role)==25){
			var opomenaJson = {};
			opomenaJson.uniqueId = req.body.id;
			opomenaJson.opomena = req.body.opomena;
			opomenaJson.datetime = new Date().getTime();
			opomenaJson.month = eval(new Date().getMonth()+1).toString().padStart(2,"0");
			opomenaJson.date = new Date().getDate().toString().padStart(2,"0");
			opomenaJson.year = new Date().getFullYear();
			opomenaJson.user = req.session.user;
			opomenaJson.type = req.body.type;
			opomeneDB.insertOne(opomenaJson)
			.then((dbResponse)=>{
				res.render("message",{
					pageTitle: "Успешно записано",
					user: req.session.user,
					message: "<div class=\"text\">Само гас :)</div>"
				});
			})
			.catch((error)=>{
				logError(error);
				res.render("message",{
					pageTitle: "Програмска грешка",
					user: req.session.user,
					message: "<div class=\"text\">Дошло је до грешке приликом уписивања у базу података.</div>"
				});
			})
		}else{
			res.send("Nije definisan nivo korisnika");
		}
	}else{
		res.redirect("/login");
	}
});

server.post('/obrisiOpomenu', async (req, res)=> {
	if(req.session.user){
		if(Number(req.session.user.role)==25){
			opomeneDB.find({uniqueId:req.body.id}).toArray()
			.then((opomene)=>{
				if(opomene.length>0){
					if(opomene[0].user.email==req.session.user.email){
						opomeneDB.deleteOne({uniqueId:req.body.id})
						.then((dbResponse)=>{
							res.render("message",{
								pageTitle: "Успешно обрисано",
								user: req.session.user,
								message: "<div class=\"text\">Само гас :)</div>"
							});
						})
						.catch((error)=>{
							res.render("message",{
								pageTitle: "Програмска грешка",
								user: req.session.user,
								message: "<div class=\"text\">Дошло је до грешке приликом уписивања у базу података 2912.</div>"
							});
						})
					}else{
						res.render("message",{
							pageTitle: "Грешка",
							user: req.session.user,
							message: "<div class=\"text\">Не можете брисати туђе опомене.</div>"
						});
					}
				}else{
					res.render("message",{
						pageTitle: "Грешка",
						user: req.session.user,
						message: "<div class=\"text\">Опомена није пронађена.</div>"
					});
				}
			})
			.catch((error)=>{
				logError(error);
				res.render("message",{
					pageTitle: "Програмска грешка",
					user: req.session.user,
					message: "<div class=\"text\">Дошло је до грешке приликом уписивања у базу података 2901.</div>"
				});
			})
		}else{
			res.send("Nije definisan nivo korisnika");
		}
	}else{
		res.redirect("/login");
	}
})

server.get('/kontrola/lokacije',async (req,res)=>{
	if(req.session.user){
		if(Number(req.session.user.role)==25){
			ekipeDB.find({}).sort({ _id: -1 }).limit(1).toArray()
			.then((ekipe)=>{
				navigacijaInfoDB.find({}).toArray()
		    .then((vozila)=>{
		    	majstoriDB.find({uniqueId:{$nin:podizvodjaci},aktivan:true}).toArray()
		    	.then((majstori)=>{
		    		res.render("kontrola/lokacije",{
							pageTitle: "Локације Мајстора",
							user: req.session.user,
							ekipe: ekipe[0],
							vozila: vozila,
							majstori: majstori
						});
		    	})
		    })
		    .catch((error)=>{
					logError(error)
					res.render("message",{
						pageTitle: "Грешка",
						user: req.session.user,
						message: "<div class=\"text\">Грешка у бази података 2422.</div>"
					});
		    })
				//console.log(ekipeJuce)
				
			})
			.catch((error)=>{
				logError(error)
				res.render("message",{
					pageTitle: "Грешка",
					user: req.session.user,
					message: "<div class=\"text\">Грешка у бази података 2517.</div>"
				});
			})
		}else{
			res.render("message",{
				pageTitle: "Грешка",
				user: req.session.user,
				message: "<div class=\"text\">Ваш налог није овлашћен да види ову страницу.</div>"
			});
		}
	}else{
		res.redirect("/login?url="+encodeURIComponent(req.url));
	}
});


server.get('/kontrola/tv',async (req,res)=>{
	if(req.session.user){
		if(Number(req.session.user.role)==25){
			majstoriDB.find({}).toArray()
			.then((majstori)=>{
				for(var i=0;i<majstori.length;i++){
					if(podizvodjaci.indexOf(majstori[i].uniqueId)>=0){
						majstori.splice(i,1);
						i--;
					}
				}
				var today = new Date();
				prisustvoDB.find({"datum.datum":getDateAsStringForDisplay(today)}).toArray()
				.then((prisustvo)=>{
					pomocniciDB.find({}).toArray()
					.then((pomocnici)=>{
						res.render("kontrola/tv",{
					    pageTitle: "ТВ",
					    prisustvo: prisustvo,
					    pomocnici: pomocnici,
					    user: req.session.user,
					    majstori: majstori
					  })
					})
					.catch((error)=>{
						logError(error);
						res.send("Greska 3")
					})
					
				})
				.catch((error)=>{
					logError(error);
					res.send("Greska 2")
				})
			})
			.catch((error)=>{
				logError(error);
				res.send("Greska")
			})
		}else{
			res.render("message",{
				pageTitle: "Грешка",
				user: req.session.user,
				message: "<div class=\"text\">Ваш налог није овлашћен да види ову страницу.</div>"
			});
		}
	}else{
		res.redirect("/login?url="+encodeURIComponent(req.url));
	}
});

server.post('/prijemnice', async (req, res)=> {
	if(req.session.user){
		if(Number(req.session.user.role)==10){
				uploadPrijemnica(req, res, function (error) {
				    if (error) {
				      logError(error);
				      return res.render("message",{pageTitle: "Грешка",message: "<div class=\"text\">Дошло је до грешке приликом качења слика.</div>",user: req.session.user});
				    }
				    for(var i=0;i<req.files.length;i++){
				    	izvestajJson.photos.push(req.files[i].transforms[0].location)
				    }
				    res.send("OK");
				});
			
		}else{
			res.send("Nije definisan nivo korisnika");
		}
	}else{
		res.redirect("/login");
	}
});

server.get('/sviNalozi',async (req,res)=>{
	if(req.session.user){
		if(Number(req.session.user.role)==10){
			res.render("administracija/listaNaloga",{
				pageTitle:"Сви налози",
				user: req.session.user
			});
		}else{
			res.render("message",{
				pageTitle: "Грешка",
				user: req.session.user,
				message: "<div class=\"text\">Ваш налог није овлашћен да види ову страницу.</div>"
			});
		}
	}else{
		res.redirect("/login?url="+encodeURIComponent(req.url));
	}
});

server.get('/spremniNalozi',async (req,res)=>{
	if(req.session.user){
		if(Number(req.session.user.role)==10 || Number(req.session.user.role)==40){
			try{
				var nalozi = await naloziDB.find({statusNaloga:"Spreman za fakturisanje"}).toArray();
				var nalozi2024 = await nalozi2024DB.find({statusNaloga:"Spreman za fakturisanje"}).toArray();
				for(var i=0;i<nalozi2024.length;i++){
					nalozi.push(nalozi2024[i])
				}
				for(var i=0;i<nalozi.length;i++){
					delete nalozi[i]._id;
					delete nalozi[i].uniqueId;
					//delete nalozi[i].digitalizacija;
					delete nalozi[i].opis;
					delete nalozi[i].vrstaRada;
					delete nalozi[i].kategorijeRadova;
					delete nalozi[i].punaAdresa;
					delete nalozi[i].obracun;
					delete nalozi[i].prijemnica;
				}
				res.render("administracija/spremniNalozi",{
					pageTitle:Number(req.session.user.role)==10 ? "Спремни за фактурисање" : "Спремни налози",
					nalozi: nalozi,
					user: req.session.user
				})
			}catch(err){
				logError(err);
				res.render("message",{
					pageTitle: "Програмска грешка",
					user: req.session.user,
					message: "<div class=\"text\">Дошло је до грешке у бази податка 1443.</div>"
				});
			}
		}else{
			res.render("message",{
				pageTitle: "Грешка",
				user: req.session.user,
				message: "<div class=\"text\">Ваш налог није овлашћен да види ову страницу.</div>"
			});
		}
	}else{
		res.redirect("/login?url="+encodeURIComponent(req.url));
	}
});

server.get('/storniraniNalozi',async (req,res)=>{
	if(req.session.user){
		if(Number(req.session.user.role)==10 || Number(req.session.user.role)==40){
			try{
				var nalozi = await naloziDB.find({statusNaloga:"Storniran"}).toArray();
				var nalozi2024 = await nalozi2024DB.find({statusNaloga:"Storniran"}).toArray();
				for(var i=0;i<nalozi2024.length;i++){
					nalozi.push(nalozi2024[i])
				}
				for(var i=0;i<nalozi.length;i++){
					delete nalozi[i]._id;
					delete nalozi[i].uniqueId;
					//delete nalozi[i].digitalizacija;
					delete nalozi[i].opis;
					delete nalozi[i].vrstaRada;
					delete nalozi[i].kategorijeRadova;
					delete nalozi[i].punaAdresa;
					delete nalozi[i].obracun;
					delete nalozi[i].prijemnica;
				}
				res.render("administracija/spremniNalozi",{
					pageTitle:"Сторнирани налози",
					nalozi: nalozi,
					user: req.session.user
				})
			}catch(err){
				logError(err);
				res.render("message",{
					pageTitle: "Програмска грешка",
					user: req.session.user,
					message: "<div class=\"text\">Дошло је до грешке у бази податка 1443.</div>"
				});
			}
		}else{
			res.render("message",{
				pageTitle: "Грешка",
				user: req.session.user,
				message: "<div class=\"text\">Ваш налог није овлашћен да види ову страницу.</div>"
			});
		}
	}else{
		res.redirect("/login?url="+encodeURIComponent(req.url));
	}
});

server.get('/fakturisaniNalozi',async (req,res)=>{
	if(req.session.user){
		if(Number(req.session.user.role)==10 || Number(req.session.user.role)==40){
			res.render("administracija/fakturisaniNalozi",{
				pageTitle:"Фактурисани налози",
				user: req.session.user
			})
		}else{
			res.render("message",{
				pageTitle: "Грешка",
				user: req.session.user,
				message: "<div class=\"text\">Ваш налог није овлашћен да види ову страницу.</div>"
			});
		}
	}else{
		res.redirect("/login?url="+encodeURIComponent(req.url));
	}
});

server.get('/cekajuValidaciju',async (req,res)=>{
	if(req.session.user){
		if(Number(req.session.user.role)==10){
			naloziDB.find({statusNaloga:"Završeno"}).toArray()
			.then((nalozi) => {
				for(var i=0;i<nalozi.length;i++){
					if(nalozi[i].obracun.length==0 ){
						nalozi.splice(i,1);
						i--;
					}	
				}
				for(var i=0;i<nalozi.length;i++){
					if(nalozi[i].prijemnica.broj==""){
						nalozi.splice(i,1);
						i--;
					}
				}
				for(var i=0;i<nalozi.length;i++){
					delete nalozi[i]._id;
					delete nalozi[i].uniqueId;
					delete nalozi[i].digitalizacija;
					delete nalozi[i].opis;
					delete nalozi[i].vrstaRada;
					delete nalozi[i].kategorijeRadova;
					delete nalozi[i].punaAdresa;
					delete nalozi[i].obracun;
					delete nalozi[i].ukupanIznos;
					delete nalozi[i].faktura;
					delete nalozi[i].prijemnica;
				}
				res.render("administracija/cekajuValidaciju",{
					pageTitle:"Чекају валидацију",
					nalozi: nalozi,
					user: req.session.user
				})
			})
			.catch((error)=>{
				logError(error);
				res.render("message",{
					pageTitle: "Програмска грешка",
					user: req.session.user,
					message: "<div class=\"text\">Дошло је до грешке у бази податка 1443.</div>"
				});
			})
		}else{
			res.render("message",{
				pageTitle: "Грешка",
				user: req.session.user,
				message: "<div class=\"text\">Ваш налог није овлашћен да види ову страницу.</div>"
			});
		}
	}else{
		res.redirect("/login?url="+encodeURIComponent(req.url));
	}
});

server.get('/neobracunatiNalozi',async (req,res)=>{
	if(req.session.user){
		if(Number(req.session.user.role)==10){
			naloziDB.find({statusNaloga:"Završeno"}).toArray()
			.then((nalozi) => {
				for(var i=0;i<nalozi.length;i++){
					if(nalozi[i].obracun){
						if(nalozi[i].obracun.length>0){
							nalozi.splice(i,1);
							i--;
						}	
					}
				}
				for(var i=0;i<nalozi.length;i++){
					delete nalozi[i]._id;
					delete nalozi[i].uniqueId;
					delete nalozi[i].digitalizacija;
					delete nalozi[i].opis;
					delete nalozi[i].vrstaRada;
					delete nalozi[i].kategorijeRadova;
					delete nalozi[i].punaAdresa;
					delete nalozi[i].obracun;
					delete nalozi[i].ukupanIznos;
					delete nalozi[i].faktura;
					delete nalozi[i].prijemnica;
				}
				res.render("administracija/neobracunatiNalozi",{
					pageTitle:"Необрачунати налози",
					nalozi: nalozi,
					user: req.session.user
				})
			})
			.catch((error)=>{
				logError(error);
				res.render("message",{
					pageTitle: "Програмска грешка",
					user: req.session.user,
					message: "<div class=\"text\">Дошло је до грешке у бази податка 1443.</div>"
				});
			})
		}else{
			res.render("message",{
				pageTitle: "Грешка",
				user: req.session.user,
				message: "<div class=\"text\">Ваш налог није овлашћен да види ову страницу.</div>"
			});
		}
	}else{
		res.redirect("/login?url="+encodeURIComponent(req.url));
	}
});

server.get('/digitalizacijaNaloga',async (req,res)=>{
	if(req.session.user){
		if(Number(req.session.user.role)==10 || Number(req.session.user.role)==20){
			res.render("digitalizacijaNaloga",{
				pageTitle:"Дигитализација налога",
				user: req.session.user
			});
		}else{
			res.redirect("/");
		}
	}else{
		res.redirect("/login?url="+encodeURIComponent(req.url));
	}
});

server.post('/digitalizacijaNaloga', async (req, res)=> {
	if(req.session.user){
		if(Number(req.session.user.role)==10 || Number(req.session.user.role)==20 ){
				uploadNalozi(req, res, function (error) {
				    if (error) {
				      logError(error);
				      return res.render("message",{pageTitle: "Грешка",message: "<div class=\"text\">Дошло је до грешке приликом дигитализације налога.</div>",user: req.session.user});
				    }
				    const filename	=	new Date().getTime()+"--nalog";
				    const file = fs.createWriteStream("./processing/"+filename+".pdf");
						https.get(req.file.location, response => {
						  var stream = response.pipe(file);
						  stream.on("finish", function() {
						    var pdfFile = fs.readFileSync("./processing/"+filename+".pdf");
						    pdfParse(pdfFile)
						    .then(function(data) {
									var nalogJson = parseNalog(data.text,req.session.user,req.file.location);
									fs.unlinkSync("./processing/"+filename+".pdf");
									naloziDB.find({broj:nalogJson.broj}).toArray()
									.then((nalozi)=>{
										if(nalozi.length==0){
											var geoCodeHeader = {
											    'accept': 'text/plain',
											    'Content-Type': 'application/json'
											};

											var geoCodeOptions = {
											    url: 'https://maps.googleapis.com/maps/api/geocode/json?address='+encodeURIComponent(nalogJson.punaAdresa)+'&key='+process.env.googlegeocoding,
											    method: 'GET',
											    headers: geoCodeHeader
											};
											nalogJson.coordinates = {};

											request(geoCodeOptions, (error,response,body)=>{
												if(error){
													console.log(error)
												}else{
													var json = JSON.parse(response.body);
													if(json.hasOwnProperty("results")){
														if(json.results.length>0){
															if(json.results[0].hasOwnProperty("geometry")){
																//console.log(json.results[0].geometry.location);
																nalogJson.coordinates = json.results[0].geometry.location; 
															}else{
																console.log("No coordinates");
															}
														}else{
															console.log("No coordinates");
														}
													}else{
														console.log("No coordinates")
													}
												}
												naloziDB.insertOne(nalogJson)
												.then((dbResponse)=>{
													usersDB.find({}).toArray()
													.then((korisnici)=>{
														var emails = [];
														for(var i=0;i<korisnici.length;i++){
															if(korisnici[i].opstine){
																if(korisnici[i].opstine.indexOf(nalogJson.radnaJedinica)>=0){
																	if(korisnici[i].hasOwnProperty("kontakt")){
																		if(korisnici[i].kontakt instanceof Array){
																			if(korisnici[i].kontakt.length>0){
																				for(var j=0;j<korisnici[i].kontakt.length;j++){
																					emails.push(korisnici[i].kontakt[j]);
																				}
																			}else{
																				emails.push("radninalog@poslovigrada.rs")
																			}
																		}else{
																			emails.push("radninalog@poslovigrada.rs")
																		}
																	}else{
																		emails.push("radninalog@poslovigrada.rs")
																	}
																}
															}
														}

														var mailOptions = {
															from: '"ВиК Портал Послова Града" <admin@poslovigrada.rs>',
															to: emails.join(","),
															subject: 'Додељен вам је нови налог број '+nalogJson.broj,
															html: 'Поштовани,<br>Додељен вам је нови ВиК налог на порталу послова града.<br>Број налога: '+nalogJson.broj+'<br>Радна јединица: '+nalogJson.radnaJedinica+'<br>Адреса: <a href=\"https://www.google.com/maps/search/?api=1&query='+nalogJson.adresa.replace(/,/g, '%2C').replace(/ /g, '+')+'\">'+nalogJson.adresa+'</a><br>Захтевалац: '+ nalogJson.zahtevalac+'<br>Опис проблема: '+nalogJson.opis+'<br><a href=\"'+process.env.siteurl+'/nalog/'+nalogJson.broj+'\">Отвори налог на порталу</a>',
														};

														transporter.sendMail(mailOptions, (error, info) => {
															if (error) {
																logError(error);
																res.redirect("/nalog/"+nalogJson.broj+"?digital=1");
															}else{
																res.redirect("/nalog/"+nalogJson.broj+"?digital=1");
															}
														});
													})
													.catch((error)=>{
														logError(error);
														res.render("message",{
															pageTitle: "Програмска грешка",
															user: req.session.user,
															message: "<div class=\"text\">Дошло је до грешке у бази податка 2301.</div>"
														});
													})
													
												})
												.catch((error)=>{
													logError(error);
													res.render("message",{
														pageTitle: "Програмска грешка",
														user: req.session.user,
														message: "<div class=\"text\">Дошло је до грешке у бази податка 879.</div>"
													});
												})
											})
										}else{
											res.render("message",{
												pageTitle: "Грешка",
												user: req.session.user,
												message: "<div class=\"text\">Налог већ постоји <a href='/nalog/"+nalogJson.broj+"' target=\"_blank\">овде</a>.</div>"
											});
										}
									})
									.catch((error)=>{
										logError(error);
							    	res.render("message",{
											pageTitle: "Програмска грешка",
											user: req.session.user,
											message: "<div class=\"text\">Дошло је до грешке у бази података 876.</div>"
										});
									})
								})
								.catch(function(error){
							    	logError(error);
							    	res.render("message",{
											pageTitle: "Програмска грешка",
											user: req.session.user,
											message: "<div class=\"text\">Дошло је до грешке приликом обраде налога.</div>"
										});
								});
						  });
						});
				});
			
		}else{
			res.render("message",{
				pageTitle: "Грешка",
				user: req.session.user,
				message: "<div class=\"text\">Није дефинисан ниво корисника.</div>"
			});
		}
	}else{
		res.redirect("/login");
	}
});

server.get('/naloziPoKategorijama',async (req,res)=>{
	if(req.session.user){
		if(Number(req.session.user.role)==10){
			naloziDB.find({}).toArray()
			.then((nalozi)=>{
				pricesDB.find({}).toArray()
				.then((prices)=>{
					var kategorije = [];
					for(var i=0;i<prices.length;i++){
						if(kategorije.indexOf(prices[i].kategorija)<0){
							if(prices[i].kategorija!=""){
								kategorije.push(prices[i].kategorija);
							}
						}
					}
					//console.log(kategorije)
					var informacije = [];
					var informacijePodizvodjaci = [];
					for(var i=0;i<meseciJson.length;i++){
						informacije.push({broj:meseciJson[i].string,ime:meseciJson[i].name,kategorije:[]});
						informacijePodizvodjaci.push({broj:meseciJson[i].string,ime:meseciJson[i].name,kategorije:[]});
					}
					for(var i=0;i<informacije.length;i++){
						for(var j=0;j<kategorije.length;j++){
							informacije[i].kategorije.push({ime:kategorije[j],iznos:0,brojNaloga:0})
						}
					}
					for(var i=0;i<informacijePodizvodjaci.length;i++){
						for(var j=0;j<kategorije.length;j++){
							informacijePodizvodjaci[i].kategorije.push({ime:kategorije[j],iznos:0,brojNaloga:0})
						}
					}

					//Izbaci naloge bez prijemnice
					for(var i=0;i<nalozi.length;i++){
						if(!nalozi[i].prijemnica.datum.datum){
							nalozi.splice(i,1);
							i--;
							//console.log("Izbacio sam nalog bez prijemnice");
						}
					}
						
					//Izbaci naloge koji su konstatacija
					var naloziKonstatacije = [];
					for(var i=0;i<nalozi.length;i++){
						if(nalozi[i].obracun.length==2 || nalozi[i].obracun.length==1){
							var kombinacije = [
									["80.04.01.002"],
									["80.04.01.004"],
									["80.04.01.005"],
									["80.04.01.002","80.04.01.004"],
									["80.04.01.004","80.04.01.002"],
									["80.04.01.002","80.04.01.005"],
									["80.04.01.005","80.04.01.002"],
									["80.04.01.004","80.04.01.005"],
									["80.04.01.005","80.04.01.004"]
								];
							var proveraArray = [];
							for(var j=0;j<nalozi[i].obracun.length;j++){
								proveraArray.push(nalozi[i].obracun[j].code);
							}
							var nalogKonstatacije = false;
							for(var j=0;j<kombinacije.length;j++){
								if(arraysEqual(kombinacije[j],proveraArray)){
									nalogKonstatacije = true;
									break;
								}
							}
							if(nalogKonstatacije){
								naloziKonstatacije.push(nalozi[i]);
								nalozi.splice(i,1);
								i--;
								//console.log("Nasao sam nalog gde je samo konstatacija");
							}
						}
					}

					

					for(var i=0;i<nalozi.length;i++){
						//nadji index u informacijama
						var informationIndex = -1;
						for(var j=0;j<informacije.length;j++){
							if(nalozi[i].prijemnica.datum.datum.includes(informacije[j].broj)){
								informationIndex = j;
								break;
							}
						}
						if(informationIndex>=0){
							if(podizvodjaci.indexOf(nalozi[i].majstor)<0){
								//Poslovi Grada
								for(var j=0;j<nalozi[i].obracun.length;j++){
									//Prepravi da sifre konstatacije budu kategorisane kao poslednja stavka
									var sifreZaKonstataciju = ["80.04.01.002","80.04.01.004","80.04.01.005"];
									if(sifreZaKonstataciju.indexOf(nalozi[i].obracun[j].code)<0){
										var nazivKategorije = "";
										var cenaKategorije = 0;
										for(var k=0;k<prices.length;k++){
											if(prices[k].code==nalozi[i].obracun[j].code){
												nazivKategorije = prices[k].kategorija;
												cenaKategorije = parseFloat(prices[k].price);
											}
										}	
									}else{
										var nazivKategorije = "";
										var cenaKategorije = 0;
										if(nalozi[i].obracun[j].code=="80.04.01.002"){
											cenaKategorije = 1150;
										}else if(nalozi[i].obracun[j].code=="80.04.01.004"){
											cenaKategorije = 4600;
										}else if(nalozi[i].obracun[j].code=="80.04.01.005"){
											cenaKategorije = 2300;
										}
										for(var k=0;k<prices.length;k++){
											if(prices[k].code==nalozi[i].obracun[nalozi[i].obracun.length-1].code){
												nazivKategorije = prices[k].kategorija;
											}
										}
									}
									
									if(nazivKategorije!=""){
										for(var k=0;k<informacije[informationIndex].kategorije.length;k++){
											if(nazivKategorije==informacije[informationIndex].kategorije[k].ime){
												informacije[informationIndex].kategorije[k].iznos = informacije[informationIndex].kategorije[k].iznos + parseFloat(nalozi[i].obracun[j].quantity)*cenaKategorije;
												informacije[informationIndex].kategorije[k].brojNaloga++;
											}
										}	
									}
									
								}
							}else{
								//Podizvodjac
								for(var j=0;j<nalozi[i].obracun.length;j++){
									//Prepravi da sifre konstatacije budu kategorisane kao poslednja stavka
									var sifreZaKonstataciju = ["80.04.01.002","80.04.01.004","80.04.01.005"];
									if(sifreZaKonstataciju.indexOf(nalozi[i].obracun[j].code)<0){
										var nazivKategorije = "";
										var cenaKategorije = 0;
										for(var k=0;k<prices.length;k++){
											if(prices[k].code==nalozi[i].obracun[j].code){
												nazivKategorije = prices[k].kategorija;
												cenaKategorije = parseFloat(prices[k].price);
											}
										}	
									}else{
										var nazivKategorije = "";
										var cenaKategorije = 0;
										if(nalozi[i].obracun[j].code=="80.04.01.002"){
											cenaKategorije = 1150;
										}else if(nalozi[i].obracun[j].code=="80.04.01.004"){
											cenaKategorije = 4600;
										}else if(nalozi[i].obracun[j].code=="80.04.01.005"){
											cenaKategorije = 2300;
										}
										for(var k=0;k<prices.length;k++){
											if(prices[k].code==nalozi[i].obracun[nalozi[i].obracun.length-1].code){
												nazivKategorije = prices[k].kategorija;
											}
										}
									}
									
									if(nazivKategorije!=""){
										for(var k=0;k<informacijePodizvodjaci[informationIndex].kategorije.length;k++){
											if(nazivKategorije==informacijePodizvodjaci[informationIndex].kategorije[k].ime){
												informacijePodizvodjaci[informationIndex].kategorije[k].iznos = informacijePodizvodjaci[informationIndex].kategorije[k].iznos + parseFloat(nalozi[i].obracun[j].quantity)*cenaKategorije;
												informacijePodizvodjaci[informationIndex].kategorije[k].brojNaloga++;
											}
										}	
									}
									
								}
							}	
						}
					}


					//Anuliraj konstatacije
					for(var i=0;i<informacije.length;i++){
						for(var j=0;j<informacije[i].kategorije.length;j++){
							if(informacije[i].kategorije[j].ime == "Konstatacija"){
								informacije[i].kategorije[j].brojNaloga = 0;
								informacije[i].kategorije[j].iznos = 0;
							}
						}
					}
					for(var i=0;i<naloziKonstatacije.length;i++){
						var informationIndex = -1;
						for(var j=0;j<informacije.length;j++){
							if(nalozi[i].prijemnica.datum.datum.includes(informacije[j].broj)){
								informationIndex = j;
								break;
							}
						}

						if(informationIndex>=0){
							if(podizvodjaci.indexOf(nalozi[i].majstor)<0){
								for(var j=0;j<informacije[informationIndex].kategorije.length;j++){
									if(informacije[informationIndex].kategorije[j].ime=="Konstatacija"){
										informacije[informationIndex].kategorije[j].iznos = informacije[informationIndex].kategorije[j].iznos + parseFloat(naloziKonstatacije[i].ukupanIznos);
										informacije[informationIndex].kategorije[j].brojNaloga;
									}
								}
							}else{
								for(var j=0;j<informacijePodizvodjaci[informationIndex].kategorije.length;j++){
									if(informacijePodizvodjaci[informationIndex].kategorije[j].ime=="Konstatacija"){
										informacijePodizvodjaci[informationIndex].kategorije[j].iznos = informacijePodizvodjaci[informationIndex].kategorije[j].iznos + parseFloat(naloziKonstatacije[i].ukupanIznos);
										informacijePodizvodjaci[informationIndex].kategorije[j].brojNaloga;
									}
								}	
							}
						}
					}


					

					res.render("administracija/naloziPoKategorijama",{
						pageTitle: "Категорије",
						user: req.session.user,
						informacije: informacije,
						informacijePodizvodjaci: informacijePodizvodjaci
					});
				})
				.catch((error)=>{
					logError(error)
					res.render("message",{
						pageTitle: "Грешка",
						user: req.session.user,
						message: "<div class=\"text\">Дошло је до грешке у бази података 2777.</div>"
					});		
				})

				
			})
			.catch((error)=>{
				logError(error);
				res.render("message",{
					pageTitle: "Грешка",
					user: req.session.user,
					message: "<div class=\"text\">Дошло је до грешке у бази података 2771.</div>"
				});	
			})
		}else{
			res.render("message",{
				pageTitle: "Грешка",
				user: req.session.user,
				message: "<div class=\"text\">Није дефинисан ниво корисника.</div>"
			});
		}
	}else{
		res.redirect("/login?url="+encodeURIComponent(req.url));
	}
});


server.get('/proveraLokacijeMajstora',async (req,res)=>{
	if(req.session.user){
		if(Number(req.session.user.role)==10 || Number(req.session.user.role)==25){
			majstoriDB.find({uniqueId:{$nin:podizvodjaci}}).toArray()
			.then((majstori)=>{
				res.render("administracija/proveraLokacijeMajstora",{
					pageTitle: "Провера локације мајстора",
					user: req.session.user,
					majstori: majstori
				});
			})
			.catch((error)=>{
				console.log(error);
			})
				
		}else{
			res.render("message",{
				pageTitle: "Грешка",
				user: req.session.user,
				message: "<div class=\"text\">Није дефинисан ниво корисника.</div>"
			});
		}
	}else{
		res.redirect("/login?url="+encodeURIComponent(req.url));
	}
});

server.get('/izvestajLokacijeMajstora/:majstorid/:date',async (req,res)=>{
	if(req.session.user){
		if(Number(req.session.user.role)==10 || Number(req.session.user.role)==25){
			var idMajstora = decodeURIComponent(req.params.majstorid);
			var date = decodeURIComponent(req.params.date);
			dodeljivaniNaloziDB.find({datumRadova:date}).toArray()
			.then((dodeljivaniNalozi)=>{
				majstoriDB.find({uniqueId:idMajstora}).toArray()
				.then((majstori)=>{
					ekipeDB.find({}).sort({_id: -1}).limit(1).toArray()
					.then((ekipe)=>{
						var ekipa = ekipe[0];
						var vozilo = "";
						for(var i=0;i<ekipa.prisustvo.ekipe.length;i++){
							if(ekipa.prisustvo.ekipe[i].idMajstora==idMajstora){
								vozilo = ekipa.prisustvo.ekipe[i].vozilo;
								break;
							}
						}
						vozilo = 50719;
						if(vozilo!="" && vozilo!=0 && vozilo!="0"){
							request(ntsOptions, (error,response,body)=>{
								if(error){
									logError(error)
									res.render("message",{
										pageTitle: "Грешка",
										user: req.session.user,
										message: "<div class=\"text\">Грешка у бази података 2921</div>"
									});
								}else{
									var cookie = response.headers['set-cookie'];
									var headers = {
										'accept': 'application/json',
								    'Cookie': cookie,
								    'Content-Type': 'application/json'
									}
									var plate = "";
									for(var i=0;i<navigacijaInfo.length;i++){
										if(navigacijaInfo[i].idNavigacije==Number(vozilo)){
											plate = navigacijaInfo[i].brojTablice;
											break;
										}
									}

									var yesterday = new Date(date);
									yesterday.setDate(yesterday.getDate()+1);
									var options = {
									    url: 'https://app.nts-international.net/ntsapi/stops?vehicle='+vozilo+'&from='+date+' 00:00:00&to='+date+' 23:59:00&timzeone=UTC&version=2.3',
									    method: 'GET',
									    headers: headers
									};
									request(options, (error,response3,body3)=>{
										if(error){
											logError(error)
										}else{
											var stops = JSON.parse(response3.body)
											res.render("administracija/izvestajLokacijeMajstora",{
												pageTitle: "Извештај локације за "+majstori[0].ime+" / "+plate+" за датум "+reshuffleDate(date),
												user: req.session.user,
												nalozi: dodeljivaniNalozi,
												vozilo: 50719,
												date: date,
												googlegeocoding: process.env.googlegeocoding,
												stops: stops
											});
										}
									});
									
									
								}
							});
						}else{
							res.render("message",{
								pageTitle: "Грешка",
								user: req.session.user,
								message: "<div class=\"text\">Мајсторово возило није у систему.</div>"
							});	
						}
					})
				})
				.catch((error)=>{
					res.render("message",{
						pageTitle: "Грешка",
						user: req.session.user,
						message: "<div class=\"text\">Мајсторово возило није у систему.</div>"
					});	
				})


				
			})
			.catch((error)=>{
				logError(error);
				res.render("message",{
					pageTitle: "Грешка",
					user: req.session.user,
					message: "<div class=\"text\">Грешка у бази података 2904</div>"
				});	
			})
		}else{
			res.render("message",{
				pageTitle: "Грешка",
				user: req.session.user,
				message: "<div class=\"text\">Није дефинисан ниво корисника.</div>"
			});
		}
	}else{
		res.redirect("/login?url="+encodeURIComponent(req.url));
	}
});

server.get('/administracija/strukturaJucerasnjihNaloga/:datum',async (req,res)=>{
	if(req.session.user){
		if(Number(req.session.user.role)==10){
			var date = req.params.datum;
			var datum = new Date(date);
			naloziDB.find({"datum.datum":getDateAsStringForDisplay(datum)}).toArray()
			.then((nalozi)=>{
				res.render("administracija/strukturaJucerasnjihNaloga",{
					pageTitle: "Структура радних налога за " + getDateAsStringForDisplay(datum),
					user: req.session.user,
					date: date,
					nalozi: nalozi 
				})
			})
			.catch((error)=>{
				logError(error);
				res.render("message",{
					pageTitle: "Грешка",
					user: req.session.user,
					message: "<div class=\"text\">Грешка у бази података 4009</div>"
				});
			})
		}else{
			res.render("message",{
				pageTitle: "Грешка",
				user: req.session.user,
				message: "<div class=\"text\">Није дефинисан ниво корисника.</div>"
			});
		}
	}else{
		res.redirect("/login?url="+encodeURIComponent(req.url));
	}
});

server.get('/administracija/stanjePoOpstinama',async (req,res)=>{
	if(req.session.user){
		if(Number(req.session.user.role)==10){
			try{
				var nalozi = await naloziDB.find({statusNaloga:{$nin:["Fakturisan","Spreman za fakturisanje","Nalog u Stambenom","Storniran"]}}).toArray();
				var nalozi2024 = await nalozi2024DB.find({statusNaloga:{$nin:["Fakturisan","Spreman za fakturisanje","Nalog u Stambenom","Storniran"]}}).toArray();
				for(var i=0;i<nalozi2024.length;i++){
					nalozi.push(nalozi2024[i])
				}
				res.render("administracija/stanjePoOpstinama",{
					pageTitle: "Стање налога по општинама",
					user: req.session.user,
					nalozi: nalozi 
				})
			}catch(err){
				logError(err);
				res.render("message",{
					pageTitle: "Грешка",
					user: req.session.user,
					message: "<div class=\"text\">Грешка у бази података 4582.</div>"
				});
			}
		}else{
			res.render("message",{
				pageTitle: "Грешка",
				user: req.session.user,
				message: "<div class=\"text\">Није дефинисан ниво корисника.</div>"
			});
		}
	}else{
		res.redirect("/login?url="+encodeURIComponent(req.url));
	}
});

server.get('/administracija/stanjePodizvodjaca',async (req,res)=>{
	if(req.session.user){
		if(Number(req.session.user.role)==10){
			try{

				var month = eval(new Date().getMonth()+1).toString().padStart(2,"0")+"."+new Date().getFullYear();
				var naloziPoPrijemnicama = await naloziDB.find({majstor:{$in: podizvodjaci},"prijemnica.datum.datum":{$regex:month}}).toArray();
				var naloziPoPrijemnicama2024 = await nalozi2024DB.find({majstor:{$in: podizvodjaci},"prijemnica.datum.datum":{$regex:month}}).toArray();
				for(var i=0;i<naloziPoPrijemnicama2024.length;i++){
					naloziPoPrijemnicama.push(naloziPoPrijemnicama2024[i])
				}
				var otvoreniNalozi = await naloziDB.find({statusNaloga:{$nin:["Storniran"]},majstor:{$in: podizvodjaci},"prijemnica.broj":""}).toArray();
				var otvoreniNalozi2024 = await nalozi2024DB.find({statusNaloga:{$nin:["Storniran"]},majstor:{$in: podizvodjaci},"prijemnica.broj":""}).toArray();
				for(var i=0;i<otvoreniNalozi2024.length;i++){
					otvoreniNalozi.push(otvoreniNalozi2024[i])
				}
				var majstori = await majstoriDB.find({uniqueId:{$in:podizvodjaci}}).toArray();
				var nalozi = naloziPoPrijemnicama;
				for(var i=0;i<otvoreniNalozi.length;i++){
					nalozi.push(otvoreniNalozi[i]);
				}

				res.render("administracija/stanjePodizvodjaca",{
					pageTitle: "Стање подизвођача",
					user: req.session.user,
					majstori:majstori,
					nalozi: nalozi 
				})
			}catch(err){
				logError(err);
				res.render("message",{
					pageTitle: "Грешка",
					user: req.session.user,
					message: "<div class=\"text\">Грешка у бази података 5178.</div>"
				});
			}
		}else{
			res.render("message",{
				pageTitle: "Грешка",
				user: req.session.user,
				message: "<div class=\"text\">Није дефинисан ниво корисника.</div>"
			});
		}
	}else{
		res.redirect("/login?url="+encodeURIComponent(req.url));
	}
});

server.get('/administracija/jucerasnjiUcinak',async (req,res)=>{
	if(req.session.user){
		if(Number(req.session.user.role)==10){
			var yesterday = new Date();
			yesterday.setDate(yesterday.getDate()-1)
			dodeljivaniNaloziDB.find({datumRadova:getDateAsStringForInputObject(yesterday),deleted: {$ne:1}}).toArray()
			.then(async (dodele)=>{
				for(var i=0;i<dodele.length;i++){
					var datumDodele = new Date(dodele[i].datumRadova);
					datumDodele.setHours(Number(dodele[i].vremeDolaska.split(":")[0]))
					datumDodele.setMinutes(Number(dodele[i].vremeDolaska.split(":")[1]))
					dodele[i].datetimeRadova = datumDodele.getTime();
				}
				dodele.sort((a, b) => a.datetimeRadova - b.datetimeRadova);
				var brojeviNaloga = [];
				for(var i=0;i<dodele.length;i++){
					if(brojeviNaloga.indexOf(dodele[i].nalog)){
						brojeviNaloga.push(dodele[i].nalog)
					}
				}
				naloziDB.find({broj:{$in:brojeviNaloga}}).toArray()
				.then(async (nalozi)=>{
					for(var i=0;i<dodele.length;i++){
						for(var j=0;j<nalozi.length;j++){
							if(dodele[i].nalog==nalozi[j].broj){
								dodele[i].opis = nalozi[j].opis;
								break;
							}
						}
					}

					majstoriDB.find({uniqueId:{$nin:podizvodjaci},aktivan:true}).toArray()
					.then(async (majstori)=>{
						var majstorIds = [];
						for(var i=0;i<majstori.length;i++){
							majstorIds.push(majstori[i].uniqueId);
							majstori[i].dodele = [];
							var proveraBrojaNalogaDuplikata = [];
							for(var j=0;j<dodele.length;j++){
								if(dodele[j].majstor==majstori[i].uniqueId){
									if(proveraBrojaNalogaDuplikata.indexOf(dodele[j].nalog)<0){
										majstori[i].dodele.push(dodele[j])
										proveraBrojaNalogaDuplikata.push(dodele[j].nalog)
									}
									
								}
							}
						}
						var monthString = eval(yesterday.getMonth()+1).toString().padStart(2,"0");
						var dateString = eval(yesterday.getDate()).toString().padStart(2,"0");
						checkInMajstoraDB.find({month:{$in:[monthString,Number(monthString)]},date:{$in:[dateString,Number(dateString)]},year:yesterday.getFullYear()}).toArray()
						.then(async (checkIns)=>{
							for(var i=0;i<majstori.length;i++){
								majstori[i].checkIns = [];
								for(var j=0;j<checkIns.length;j++){
									if(majstori[i].uniqueId == checkIns[j].uniqueId){
										majstori[i].checkIns.push(checkIns[j])
									}
								}
							}
							for(var i=0;i<majstori.length;i++){
								majstori[i].vremeDolaska = "Није се чекирао";
								majstori[i].vremeOdlaska = "Није се чекирао";
								if(majstori[i].checkIns.length>0){
									majstori[i].vremeDolaska = majstori[i].checkIns[0].timestamp;
									majstori[i].vremeOdlaska = majstori[i].checkIns[majstori[i].checkIns.length-1].timestamp;
								}
							}
							for(var i=0;i<majstori.length;i++){
								if(majstori[i].vremeDolaska==majstori[i].vremeOdlaska){
									majstori[i].vremeOdlaska = "Није се чекирао";
								}
							}

							var vozila2 = JSON.parse(JSON.stringify(vozila));
							var startTime = yesterday.toISOString().split('T')[0] + " 00:00:00";
        			var endTime = yesterday.toISOString().split('T')[0] + " 23:59:59";

							config = {
						    url: baseUrl + '/api/DailySummary/GetDailySummary',
						    method: 'POST', // If necessary
						    headers: { 
						        'Content-Type': 'application/json',
						        'Authorization': `Bearer ${token}`
						    },
						    data: { 
						    	'ClientId': process.env.telematicsid, 
						    	'TimeZone':'Central Standard Time',
						    	'StartTime': startTime,
					        'EndTime': endTime
						    }
							};
							console.log("Waiting daily summary")
							var dailySummary = await axios(config);
							for(var i=0;i<dailySummary.data.length;i++){
								for(var j=0;j<vozila2.vozila.Data.length;j++){
									if(vozila2.vozila.Data[j].DeviceName==dailySummary.data[i].RegNo){
										vozila2.vozila.Data[j].dailySummary = dailySummary.data[i];
									}
								}
							}
							
							for(var i=0;i<vozila2.vozila.Data.length;i++){
								var config = {
	                url: baseUrl + '/api/Trip/GetMileageSummary',
	                method: 'POST',
	                headers: {
	                    'Content-Type': 'application/json',
	                    'Authorization': `Bearer ${token}`
	                },
	                data: {
	                    'ImeiNumber': Number(vozila2.vozila.Data[i].ImeiNumber),
	                    'StartTime': startTime,
	                    'EndTime': endTime,
	                    'TimeZone': 'Central European Standard Time'
	                }
		            };

                const response = await axios(config);
                console.log("Received vozilo "+ i)
                vozila2.vozila.Data[i].mileageSummary = response.data;
								await new Promise(resolve => setTimeout(resolve, 2000));
							}

							
							res.render("administracija/jucerasnjiUcinak",{
								pageTitle: "Јучерашњи учинак мајстора",
								user: req.session.user,
								majstori: majstori,
								vozila: vozila2
							})
						})
						.catch((error)=>{
							logError(error);
							res.render("message",{
								pageTitle: "Грешка",
								user: req.session.user,
								message: "<div class=\"text\">Грешка у бази података 4582.</div>"
							});
						})
					})
					.catch((error)=>{
						logError(error);
						res.render("message",{
							pageTitle: "Грешка",
							user: req.session.user,
							message: "<div class=\"text\">Грешка у бази података 4582.</div>"
						});
					})

				})
				.catch((error)=>{
					logError(error);
					res.render("message",{
						pageTitle: "Грешка",
						user: req.session.user,
						message: "<div class=\"text\">Грешка у бази података 4582.</div>"
					});
				})
				
			})
			.catch((error)=>{
				logError(error);
				res.render("message",{
					pageTitle: "Грешка",
					user: req.session.user,
					message: "<div class=\"text\">Грешка у бази података 4582.</div>"
				});
			})

			
		}else{
			res.render("message",{
				pageTitle: "Грешка",
				user: req.session.user,
				message: "<div class=\"text\">Није дефинисан ниво корисника.</div>"
			});
		}
	}else{
		res.redirect("/login?url="+encodeURIComponent(req.url));
	}
});

server.get('/administracija/danasnjiUcinak',async (req,res)=>{
	if(req.session.user){
		if(Number(req.session.user.role)==10){
			var yesterday = new Date();
			//yesterday.setDate(yesterday.getDate()-1)
			dodeljivaniNaloziDB.find({datumRadova:getDateAsStringForInputObject(yesterday),deleted: {$ne:1}}).toArray()
			.then((dodele)=>{
				for(var i=0;i<dodele.length;i++){
					var datumDodele = new Date(dodele[i].datumRadova);
					datumDodele.setHours(Number(dodele[i].vremeDolaska.split(":")[0]))
					datumDodele.setMinutes(Number(dodele[i].vremeDolaska.split(":")[1]))
					dodele[i].datetimeRadova = datumDodele.getTime();
				}
				dodele.sort((a, b) => a.datetimeRadova - b.datetimeRadova);
				var brojeviNaloga = [];
				for(var i=0;i<dodele.length;i++){
					if(brojeviNaloga.indexOf(dodele[i].nalog)){
						brojeviNaloga.push(dodele[i].nalog)
					}
				}
				naloziDB.find({broj:{$in:brojeviNaloga}}).toArray()
				.then((nalozi)=>{
					for(var i=0;i<dodele.length;i++){
						for(var j=0;j<nalozi.length;j++){
							if(dodele[i].nalog==nalozi[j].broj){
								dodele[i].opis = nalozi[j].opis;
								break;
							}
						}
					}

					majstoriDB.find({uniqueId:{$nin:podizvodjaci},aktivan:true}).toArray()
					.then((majstori)=>{
						var majstorIds = [];
						for(var i=0;i<majstori.length;i++){
							majstorIds.push(majstori[i].uniqueId);
							majstori[i].dodele = [];
							var proveraBrojaNalogaDuplikata = [];
							for(var j=0;j<dodele.length;j++){
								if(dodele[j].majstor==majstori[i].uniqueId){
									if(proveraBrojaNalogaDuplikata.indexOf(dodele[j].nalog)<0){
										majstori[i].dodele.push(dodele[j])
										proveraBrojaNalogaDuplikata.push(dodele[j].nalog)
									}
									
								}
							}
						}
						var monthString = eval(yesterday.getMonth()+1).toString().padStart(2,"0");
						var dateString = eval(yesterday.getDate()).toString().padStart(2,"0");
						checkInMajstoraDB.find({month:{$in:[monthString,Number(monthString)]},date:{$in:[dateString,Number(dateString)]},year:yesterday.getFullYear()}).toArray()
						.then((checkIns)=>{
							for(var i=0;i<majstori.length;i++){
								majstori[i].checkIns = [];
								for(var j=0;j<checkIns.length;j++){
									if(majstori[i].uniqueId == checkIns[j].uniqueId){
										majstori[i].checkIns.push(checkIns[j])
									}
								}
							}
							for(var i=0;i<majstori.length;i++){
								majstori[i].vremeDolaska = "Није се чекирао";
								majstori[i].vremeOdlaska = "Није се чекирао";
								if(majstori[i].checkIns.length>0){
									majstori[i].vremeDolaska = majstori[i].checkIns[0].timestamp;
									majstori[i].vremeOdlaska = majstori[i].checkIns[majstori[i].checkIns.length-1].timestamp;
								}
							}
							for(var i=0;i<majstori.length;i++){
								if(majstori[i].vremeDolaska==majstori[i].vremeOdlaska){
									majstori[i].vremeOdlaska = "Није се чекирао";
								}
							}
							
							res.render("administracija/jucerasnjiUcinak",{
								pageTitle: "Данашњи учинак мајстора",
								user: req.session.user,
								majstori: majstori 
							})
						})
						.catch((error)=>{
							logError(error);
							res.render("message",{
								pageTitle: "Грешка",
								user: req.session.user,
								message: "<div class=\"text\">Грешка у бази података 4582.</div>"
							});
						})
					})
					.catch((error)=>{
						logError(error);
						res.render("message",{
							pageTitle: "Грешка",
							user: req.session.user,
							message: "<div class=\"text\">Грешка у бази података 4582.</div>"
						});
					})

				})
				.catch((error)=>{
					logError(error);
					res.render("message",{
						pageTitle: "Грешка",
						user: req.session.user,
						message: "<div class=\"text\">Грешка у бази података 4582.</div>"
					});
				})
				
			})
			.catch((error)=>{
				logError(error);
				res.render("message",{
					pageTitle: "Грешка",
					user: req.session.user,
					message: "<div class=\"text\">Грешка у бази података 4582.</div>"
				});
			})

			
		}else{
			res.render("message",{
				pageTitle: "Грешка",
				user: req.session.user,
				message: "<div class=\"text\">Није дефинисан ниво корисника.</div>"
			});
		}
	}else{
		res.redirect("/login?url="+encodeURIComponent(req.url));
	}
});

server.post('/strukturaNaloga',async (req,res)=>{
	if(req.session.user){
		if(Number(req.session.user.role)==10){
			var json = JSON.parse(req.body.json);
			var mail = "<h1>Структура радних налога за дан: "+reshuffleDate(json[0].datum)+"</h1><br>";
			for(var i=0;i<json.length;i++){
				mail += "<h2 style=\"padding-left:10px\">"+json[i].radnaJedinica+" ("+json[i].nalozi+" налога)</h2>";
				for(var j=0;j<json[i].types.length;j++){
					mail += "<h3 style=\"padding-left:15px\">"+json[i].types[j].type+" ("+json[i].types[j].nalozi+")</h3>";
				}
			}

			var mailOptions = {
				from: '"ВиК Портал Послова Града" <admin@poslovigrada.rs>',
				to: "miloscane@gmail.com,stefan.jankovic.ckp@gmail.com,marija.slijepcevic@poslovigrada.rs,momir.lutovac@poslovigrada.rs,nenad.papes@poslovigrada.rs,vladimir.miljkovic@poslovigrada.rs",
				subject: "Структура радних налога за дан: "+reshuffleDate(json[0].datum),
				html: mail
			};

			transporter.sendMail(mailOptions, (error, info) => {
				if (error) {
					logError(error);
				}
				res.render("message",{
					pageTitle: "Браво!",
					user: req.session.user,
					message: "<div class=\"text\">Успешно послат емаил директору.</div>"
				});
			});

			
		}else{
			res.render("message",{
				pageTitle: "Грешка",
				user: req.session.user,
				message: "<div class=\"text\">Није дефинисан ниво корисника.</div>"
			});
		}
	}else{
		res.redirect("/login")
	}
});




server.get('/administracija/specifikacijeMajstora/:datum',async (req,res)=>{
	if(req.session.user){
		if(Number(req.session.user.role)==10){
			var date = req.params.datum;
			var datum = new Date(date);
			majstoriDB.find({uniqueId:{$nin:podizvodjaci},active:true}).toArray()
			then((majstori)=>{
				dodeljivaniNaloziDB.find({"datum.datum":reshuffleDate(req.params.date),deleted:{$exists:false}}).toArray()
				.then((dodele)=>{
					var brojeviNaloga = [];
					for(var i=0;i<dodele.length;i++){
						brojeviNaloga.push(dodele[i].nalog)
					}
					naloziDB.find({broj:{$in:brojeviNaloga}}).toArray()
					.then((nalozi)=>{
						res.render("administracija/strukturaJucerasnjihNaloga",{
							pageTitle: "Структура радних налога мајстора " + getDateAsStringForDisplay(datum),
							user: req.session.user,
							date: date,
							nalozi: nalozi,
							dodele: dodele,
							majstori: majstori 
						})
					})
					.catch((error)=>{
						logError(error);
						res.render("message",{
							pageTitle: "Грешка",
							user: req.session.user,
							message: "<div class=\"text\">Грешка у бази података 4098</div>"
						});
					})
				})
				.catch((error)=>{
					logError(error);
					res.render("message",{
						pageTitle: "Грешка",
						user: req.session.user,
						message: "<div class=\"text\">Грешка у бази података 4092</div>"
					});
				})
			})
			.catch((error)=>{
				logError(error);
				res.render("message",{
					pageTitle: "Грешка",
					user: req.session.user,
					message: "<div class=\"text\">Грешка у бази података 4090</div>"
				});
			})
		}else{
			res.render("message",{
				pageTitle: "Грешка",
				user: req.session.user,
				message: "<div class=\"text\">Није дефинисан ниво корисника.</div>"
			});
		}
	}else{
		res.redirect("/login?url="+encodeURIComponent(req.url));
	}
});

server.get('/administracija/specifikacijePodizvodjaca',async (req,res)=>{
	if(req.session.user){
		if(Number(req.session.user.role)==10){
			try{
				var specifikacije = await specifikacijePodizvodjacaDB.find({}).toArray();
				var naloziToFind = [];
				for(var i=0;i<specifikacije.length;i++){
					for(var j=0;j<specifikacije[i].nalozi.length;j++){
						naloziToFind.push(specifikacije[i].nalozi[j].broj)
					}
				}
				var nalozi = await naloziDB.find({broj:{$in:naloziToFind}}).toArray();
				var nalozi2024 = await nalozi2024DB.find({broj:{$in:naloziToFind}}).toArray();
				for(var i=0;i<nalozi2024.length;i++){
					nalozi.push(nalozi2024[i]);
				}
				for(var i=0;i<specifikacije.length;i++){
					var ukupanIznosPG = 0;
					for(var j=0;j<specifikacije[i].nalozi.length;j++){
						for(var k=0;k<nalozi.length;k++){
							if(nalozi[k].broj==specifikacije[i].nalozi[j].broj){
								var iznosNaloga = isNaN(parseFloat(nalozi[k].ukupanIznos)) ? 0 : parseFloat(nalozi[k].ukupanIznos);
								ukupanIznosPG = ukupanIznosPG + iznosNaloga;
								specifikacije[i].nalozi[j].iznosPG = nalozi[k].ukupanIznos;
								break;
							}
						}
					}
					specifikacije[i].ukupanIznosPG = ukupanIznosPG;
				}
				res.render("administracija/specifikacijePodizvodjaca",{
					pageTitle:"Спецификације подизвођача",
					specifikacije: specifikacije,
					user: req.session.user
				});
			}catch(err){
				logError(err);
				res.render("message",{
					pageTitle: "Грешка",
					message: "<div class=\"text\">Дошло је до грешке у бази податка 2482.</div>",
					user: req.session.user
				});
			}
		}else{
			res.render("message",{
				pageTitle: "Грешка",
				user: req.session.user,
				message: "<div class=\"text\">Ваш налог није овлашћен да види ову страницу.</div>"
			});
		}
	}else{
		res.redirect("/login?url="+encodeURIComponent(req.url));
	}
});

server.get('/administracija/specifikacijaPodizvodjaca/:uniqueId',async (req,res)=>{
	if(req.session.user){
		if(Number(req.session.user.role)==10){
			try{
				var specifikacije = await specifikacijePodizvodjacaDB.find({uniqueId:req.params.uniqueId}).toArray();
				var naloziToFind = [];
				for(var i=0;i<specifikacije[0].nalozi.length;i++){
					naloziToFind.push(specifikacije[0].nalozi[i].broj)
				}
				var nalozi = await naloziDB.find({broj:{$in:naloziToFind}}).toArray();
				var nalozi2024 = await nalozi2024DB.find({broj:{$in:naloziToFind}}).toArray();
				for(var i=0;i<nalozi2024.length;i++){
					nalozi.push(nalozi2024[i]);
				}
				for(var i=0;i<specifikacije[0].nalozi.length;i++){
					for(var j=0;j<nalozi.length;j++){
						if(nalozi[j].broj==specifikacije[0].nalozi[i].broj){
							specifikacije[0].nalozi[i].iznosPG = nalozi[j].ukupanIznos;
						}
					}
				}
				res.render("administracija/specifikacijaPodizvodjaca",{
					pageTitle:"Спецификацијa подизвођачa <b>" +specifikacije[0].user.name + "</b> број <b>"+ specifikacije[0].brojSpecifikacije+"</b>",
					specifikacija: specifikacije[0],
					user: req.session.user
				});
			}catch(err){
				logError(err);
				res.render("message",{
					pageTitle: "Грешка",
					message: "<div class=\"text\">Дошло је до грешке у бази податка 2332.</div>",
					user: req.session.user
				});
			}
			
		}else{
			res.render("message",{
				pageTitle: "Грешка",
				user: req.session.user,
				message: "<div class=\"text\">Ваш налог није овлашћен да види ову страницу.</div>"
			});
		}
	}else{
		res.redirect("/login?url="+encodeURIComponent(req.url));
	}
});

server.post('/administracija/odobri-specifikaciju',async (req,res)=>{
	if(req.session.user){
		if(Number(req.session.user.role)==10){
			var setObj	=	{ $set: {
				odobrena: "1"
			}};							
			specifikacijePodizvodjacaDB.updateOne({uniqueId:req.body.specifikacija},setObj)
			.then((dbResponse2) => {
				res.redirect("/administracija/specifikacijaPodizvodjaca/"+req.body.specifikacija);
			})
			.catch((error)=>{
				logError(error)
				res.render("message",{
					pageTitle: "Грешка",
					message: "<div class=\"text\">Дошло је до грешке у бази податка 2149.</div>",
					user: req.session.user
				});
			})
			
		}else{
			res.render("message",{
				pageTitle: "Грешка",
				user: req.session.user,
				message: "<div class=\"text\">Ваш налог није овлашћен да види ову страницу.</div>"
			});
		}
	}else{
		res.redirect("/");
	}
});

server.post('/administracija/ponisti-specifikaciju',async (req,res)=>{
	if(req.session.user){
		if(Number(req.session.user.role)==10){
			var setObj	=	{ $set: {
				odobrena: "0"
			}};							
			specifikacijePodizvodjacaDB.updateOne({uniqueId:req.body.specifikacija},setObj)
			.then((dbResponse2) => {
				res.redirect("/administracija/specifikacijaPodizvodjaca/"+req.body.specifikacija);
			})
			.catch((error)=>{
				logError(error)
				res.render("message",{
					pageTitle: "Грешка",
					message: "<div class=\"text\">Дошло је до грешке у бази податка 2149.</div>",
					user: req.session.user
				});
			})
			
		}else{
			res.render("message",{
				pageTitle: "Грешка",
				user: req.session.user,
				message: "<div class=\"text\">Ваш налог није овлашћен да види ову страницу.</div>"
			});
		}
	}else{
		res.redirect("/");
	}
});

server.get('/nalog/:broj',async (req,res)=>{
	if(req.session.user){
		if(Number(req.session.user.role)==10 || Number(req.session.user.role)==20 || Number(req.session.user.role)==25 || Number(req.session.user.role)==30){
			//administracija, dispeceri, podizvodjaci
			try{
				var nalozi = await naloziDB.find({broj:req.params.broj.toString()}).toArray();
				var	nalozi2024 = await nalozi2024DB.find({broj:req.params.broj.toString()}).toArray();
				if(nalozi.length==0 && nalozi2024.length==0){
					return res.render("message",{
						pageTitle: "Непостојећи налог",
						message: "<div class=\"text\">Налог број "+req.params.broj+" не постоји у бази података.</div>",
						user: req.session.user
					});
				}
				var majstori = await majstoriDB.find({}).toArray();
				for(var i=0;i<majstori.length;i++){
					if(!majstori[i].aktivan){
						if(podizvodjaci.indexOf(majstori[i].uniqueId)<0){
							majstori.splice(i,1);
							i--;
						}
					}
				}
				var istorijat = await istorijaNalogaDB.find({broj:req.params.broj.toString()}).toArray();
				var izvestaji = await izvestajiDB.find({nalog:req.params.broj.toString()}).toArray();
				var ucinci = await ucinakMajstoraDB.find({brojNaloga:req.params.broj.toString()}).toArray();
				var dodele = await dodeljivaniNaloziDB.find({nalog:req.params.broj}).toArray();
				var reversi = await magacinReversiDB.find({nalog:req.params.broj}).toArray();
				var proizvodi = await proizvodiDB.find({}).toArray();
				var nalog2024 = nalozi2024.length>0 ? true : false;
				if(nalog2024){
					nalozi[0] = nalozi2024[0];
				}
				var cenovnikPG = cenovnik;
				if(nalog2024){
					cenovnikPG = cenovnik2024;
				}
				if(Number(req.session.user.role)==10){
					var podizvodjac = 0;
					var cenovnikPodizvodjaca = [];
					if(podizvodjaci.indexOf(nalozi[0].majstor)>=0){
						podizvodjac = 1;
						if(nalozi[0].majstor=="SeHQZ--1672650353244" || nalozi[0].majstor=="IIwY4--1672650358507" || nalozi[0].majstor=="mile--1672650353244"){
							if(nalog2024){
								cenovnikPodizvodjaca = cenovnikHigh2024;
							}else{
								cenovnikPodizvodjaca = cenovnikHigh;
							}
						}else{
							if(nalog2024){
								cenovnikPodizvodjaca = cenovnikLow;
							}else{
								cenovnikPodizvodjaca = cenovnikHigh;
							}
						}
						
						
						for(var i=0;i<cenovnikPG.length;i++){
							for(var j=0;j<cenovnikPodizvodjaca.length;j++){
								if(cenovnikPG[i].code==cenovnikPodizvodjaca[j].code){
									cenovnikPG[i].podizvodjacPrice = cenovnikPodizvodjaca[j].price;
									break;
								}
							}
						}
					}
					res.render("administracija/nalog",{
						pageTitle:"Налог број " + req.params.broj,
						nalog: nalozi[0],
						majstori: majstori,
						cenovnik: cenovnikPG,
						stariCenovnik: stariCenovnik,
						istorijat: istorijat,
						izvestaji: izvestaji,
						ucinci: ucinci,
						phoneAccessCode: phoneAccessCode,
						podizvodjac: podizvodjac,
						dodele: dodele,
						reversi: reversi,
						proizvodi: proizvodi,
						user: req.session.user
					});

				}else if(Number(req.session.user.role)==20){
					res.render("dispeceri/nalog",{
						pageTitle:"Налог број " + req.params.broj,
						nalog: nalozi[0],
						majstori: majstori,
						cenovnik: cenovnik,
						istorijat: istorijat,
						izvestaji: izvestaji,
						ucinci: ucinci,
						dodele: dodele,
						phoneAccessCode: phoneAccessCode,
						lokacijeMajstora: [],
						user: req.session.user
					});
				}else if(Number(req.session.user.role)==25){
					res.render("kontrola/nalog",{
						pageTitle:"Налог број " + req.params.broj,
						nalog: nalozi[0],
						majstori: majstori,
						istorijat: istorijat,
						izvestaji: izvestaji,
						dodele: dodele,
						ucinci: ucinci,
						phoneAccessCode: phoneAccessCode,
						user: req.session.user
					});
				}else if(Number(req.session.user.role)==30){
					var obrada = ["Nalog u Stambenom","Spreman za fakturisanje","Spreman za obračun"];
					if(obrada.indexOf(nalozi[0].statusNaloga)>=0){
						nalozi[0].statusNaloga = "U obradi";
					}
					if(nalozi[0].statusNaloga=="Fakturisan"){
						nalozi[0].statusNaloga = "Možete fakturisati";
					}

					/*if(nalozi[0].faktura.podizvodjac.broj!=""){
						nalozi[0].statusNaloga = "Fakturisan";
					}*/
					for(var i=0;i<istorijat.length;i++){
						if(obrada.indexOf(istorijat[i].statusNaloga)>=0){
							istorijat[i].statusNaloga = "U obradi";
						}
						if(istorijat[i].statusNaloga=="Fakturisan"){
							istorijat[i].statusNaloga = "Možete fakturisati";
						}
					}
					if(nalozi[0].majstor==req.session.user.nalozi){
						var cenovnikZaPrikaz = [];
						if(req.session.user.nalozi=="SeHQZ--1672650353244" || req.session.user.nalozi=="IIwY4--1672650358507" || req.session.user.nalozi=="mile--1672650353244"){
							if(nalog2024){
								cenovnikZaPrikaz = cenovnikHigh2024;
							}else{
								cenovnikZaPrikaz = cenovnikHigh;
							}
						}else{
							if(nalog2024){
								cenovnikZaPrikaz  = cenovnikLow;
							}else{
								cenovnikZaPrikaz  = cenovnikHigh;
							}
						}
						res.render("podizvodjaci/nalog",{
							pageTitle:"Налог број " + req.params.broj,
							nalog: nalozi[0],
							majstori: majstori,
							cenovnik: cenovnikZaPrikaz,
							istorijat: istorijat,
							izvestaji: izvestaji,
							phoneAccessCode: phoneAccessCode,
							user: req.session.user
						});
					}else{
						res.render("message",{
							pageTitle: "Грешка",
							message: "<div class=\"text\">Налог није додељен вама.</div>",
							user: req.session.user
						});
					}
				}else{
					res.render("message",{
						pageTitle: "Програмска грешка",
						message: "<div class=\"text\">Није дефинисан ниво корисника.</div>",
						user: req.session.user
					});
				}
			}catch(err){
				logError(err);
				res.render("message",{
					pageTitle: "Грешка",
					message: "<div class=\"text\">Дошло је до грешке у бази податка 3376.</div>",
					user: req.session.user
				});
			}
		}else if(Number(req.session.user.role)==40){
			//premijus
			try{
				var nalozi = await naloziDB.find({broj:req.params.broj.toString()}).toArray();
				var nalozi2024 = await nalozi2024DB.find({broj:req.params.broj.toString()}).toArray();
				if(nalozi.length==0 && nalozi2024.length==0){
					return res.render("message",{
						pageTitle: "Грешка",
						message: "<div class=\"text\">Непостојећи налог.</div>",
						user: req.session.user
					});
				}
				if(nalozi.length==0){
					nalozi[0] = nalozi2024[0];
				}
				var allowed = ["Spreman za fakturisanje","Fakturisan","Storniran"];
				if(allowed.indexOf(nalozi[0].statusNaloga)>=0){
					res.render("premijus/nalog",{
						pageTitle:"Налог број " + req.params.broj,
						nalog: nalozi[0],
						user: req.session.user
					});
				}else{
					res.render("message",{
						pageTitle: "Грешка",
						message: "<div class=\"text\">Налог није спреман за Премијус.</div>",
						user: req.session.user
					});
				}

			}catch(err){
				logError(err);
				res.render("message",{
					pageTitle: "Грешка",
					message: "<div class=\"text\">Дошло је до грешке у бази податка 710.</div>",
					user: req.session.user
				});
			}
		}else{
			res.render("message",{
				pageTitle: "Грешка",
				message: "<div class=\"text\">Није дефинисан ниво корисника.</div>",
				user: req.session.user
			});
		}
	}else{
		res.redirect("/login?url="+encodeURIComponent(req.url));
	}
});

server.post('/majstorNaNalogu',async (req,res)=>{
	if(req.session.user){
		if(Number(req.session.user.role)==20 || Number(req.session.user.role)==10){
			var json = JSON.parse(req.body.json);
			json.datum  = {};
			var currentDate = new Date(new Date().getTime()+2*3.6e+6);
			var currentHour = currentDate.getHours().toString().length==1 ? "0"+currentDate.getHours() : currentDate.getHours();
			var currentMinute = currentDate.getMinutes().toString().length==1 ? "0"+currentDate.getMinutes() : currentDate.getMinutes();
			var timeStamp =  currentHour +":"+currentMinute;
			json.datum.datetime = currentDate.getTime();
			json.datum.datum = getDateAsStringForDisplay(currentDate);
			json.datum.timestamp = timeStamp;
			json.datumRadova = json.datumRadova;
			json.uniqueId = generateId(5)+"--"+currentDate.getTime();
			majstoriDB.find({uniqueId:json.majstor}).toArray()
			.then((majstori)=>{
				dodeljivaniNaloziDB.insertOne(json)
					.then((dbResponse)=>{
						io.emit("majstorNaNalogu",json)
						var setObj	=	{ $set: {
								majstor: json.majstor
							}};
						naloziDB.updateOne({broj:json.nalog},setObj)
						.then((dbResponse) => {
							res.render("message",{
								pageTitle: "Мајстор послат на налог",
								message: "<div class=\"text\">Успешно сте заказали <b>"+majstori[0].ime+"</b> на налог број "+json.nalog+" - <b>"+json.adresa+"</b>, "+json.radnaJedinica+".<br>&nbsp;<b>Датум</b>"+json.datumRadova+"<br><b>Време:</b> "+json.vremeRadova+"</div><br><a href=\"/nalog/"+json.nalog+"\">Повратак на налог</a></div>",
								user: req.session.user
							});
						})
						.catch((error)=>{
							logError(error);
							res.render("message",{
								pageTitle: "Грешка",
								message: "<div class=\"text\">Грешка у бази података 3790.</div>",
								user: req.session.user
							});
						});
					})
					.catch((error)=>{
						logError(error);
						res.render("message",{
							pageTitle: "Грешка",
							message: "<div class=\"text\">Грешка у бази података 3548.</div>",
							user: req.session.user
						});
					})
			})
			.catch((error)=>{
				logError(error);
				res.render("message",{
					pageTitle: "Грешка",
					message: "<div class=\"text\">Грешка у бази података 3545.</div>",
					user: req.session.user
				});
			})
		}else{
			res.render("message",{
				pageTitle: "Грешка",
				message: "<div class=\"text\">Нисте овлашћени да шаљете мајстора на налог.</div>",
				user: req.session.user
			});
		}
	}else{
		res.redirect("/login")
	}
});

server.post('/deleteMajstorNaNalogu',async (req,res)=>{
	if(req.session.user){
		if(Number(req.session.user.role)==20 || Number(req.session.user.role)==10){
			dodeljivaniNaloziDB.find({uniqueId:req.body.id}).toArray()
			.then((dodele)=>{
				if(dodele[0].user.email == req.session.user.email){
					var setObj	=	{ $set: {
								deleted: 1
							}};
					dodeljivaniNaloziDB.updateOne({uniqueId:req.body.id},setObj)
					.then((dbResponse) => {
						res.render("message",{
							pageTitle: "Порука",
							message: "<div class=\"text\">Успешно сте <b>обрисали</b> доделу.<br><a href=\"/nalog/"+dodele[0].nalog+"\">Повратак на налог</a></div>",
							user: req.session.user
						});
					})
					.catch((error)=>{
						logError(error);
						res.render("message",{
							pageTitle: "Грешка",
							message: "<div class=\"text\">Грешка у бази података 4827.</div>",
							user: req.session.user
						});
					})
				}else{
					res.render("message",{
						pageTitle: "Грешка",
						message: "<div class=\"text\">Не можете мењати туђу доделу.</div>",
						user: req.session.user
					});
				}
			})
			.catch((error)=>{
				logError(error);
				res.render("message",{
					pageTitle: "Грешка",
					message: "<div class=\"text\">Грешка у бази података 4821.</div>",
					user: req.session.user
				});
			})
		}else{
			res.render("message",{
				pageTitle: "Грешка",
				message: "<div class=\"text\">Нисте овлашћени да шаљете мајстора на налог.</div>",
				user: req.session.user
			});
		}
	}else{
		res.redirect("/login")
	}
});

server.post('/editMajstorNaNalogu',async (req,res)=>{
	if(req.session.user){
		if(Number(req.session.user.role)==20 || Number(req.session.user.role)==10){
			dodeljivaniNaloziDB.find({uniqueId:req.body.id}).toArray()
			.then((dodele)=>{
				var json = JSON.parse(req.body.json);
				//if(dodele[0].user.email == req.session.user.email){
					var zavrsetak = {};
					
					var setObj	=	{ $set: {
								vremeDolaska: json.vremeDolaska,
								vremeRadova: json.vremeRadova,
								datumRadova: json.datumRadova,
								zavrsetak: zavrsetak
							}};
					dodeljivaniNaloziDB.updateOne({uniqueId:json.uniqueId},setObj)
					.then((dbResponse) => {
						res.render("message",{
							pageTitle: "Порука",
							message: "<div class=\"text\">Успешно сте <b>изменили</b> доделу. <a href=\"/nalog/"+json.brojNaloga+"\">Повратак на налог</a></div>",
							user: req.session.user
						});
					})
					.catch((error)=>{
						logError(error);
						res.render("message",{
							pageTitle: "Грешка",
							message: "<div class=\"text\">Грешка у бази података 4827.</div>",
							user: req.session.user
						});
					})
				//}else{
					//res.render("message",{
						//pageTitle: "Грешка",
						//message: "<div class=\"text\">Не можете мењати туђу доделу.</div>",
						//user: req.session.user
					//});
				//}
			})
			.catch((error)=>{
				logError(error);
				res.render("message",{
					pageTitle: "Грешка",
					message: "<div class=\"text\">Грешка у бази података 4821.</div>",
					user: req.session.user
				});
			})
		}else{
			res.render("message",{
				pageTitle: "Грешка",
				message: "<div class=\"text\">Нисте овлашћени да шаљете мајстора на налог.</div>",
				user: req.session.user
			});
		}
	}else{
		res.redirect("/login")
	}
});

server.post('/majstorStigao',async (req,res)=>{
	if(req.session.user){
		if(Number(req.session.user.role)==20){
			dodeljivaniNaloziDB.find({uniqueId:req.body.id}).toArray()
			.then((dodele)=>{
				//if(dodele[0].user.email == req.session.user.email){
					var setObj	=	{ $set: {
								majstorStigao: 1,
								vremeStizanja: new Date().getTime()
							}};
					dodeljivaniNaloziDB.updateOne({uniqueId:req.body.id},setObj)
					.then((dbResponse) => {
						io.emit("majstorStigao",req.body.id)
						res.redirect("/nalog/"+dodele[0].nalog)
					})
					.catch((error)=>{
						logError(error);
						res.render("message",{
							pageTitle: "Грешка",
							message: "<div class=\"text\">Грешка у бази података 4827.</div>",
							user: req.session.user
						});
					})
				//}else{
					//res.render("message",{
						//pageTitle: "Грешка",
						//message: "<div class=\"text\">Не можете мењати туђу доделу.</div>",
						//user: req.session.user
					//});
				//}
			})
			.catch((error)=>{
				logError(error);
				res.render("message",{
					pageTitle: "Грешка",
					message: "<div class=\"text\">Грешка у бази података 4821.</div>",
					user: req.session.user
				});
			})
		}else{
			res.render("message",{
				pageTitle: "Грешка",
				message: "<div class=\"text\">Ваш налог није овлашћен да мења статус доделе.</div>",
				user: req.session.user
			});
		}
	}else{
		res.redirect("/login")
	}
});

server.post('/majstorZavrsio',async (req,res)=>{
	if(req.session.user){
		if(Number(req.session.user.role)==20){
			dodeljivaniNaloziDB.find({uniqueId:req.body.id}).toArray()
			.then((dodele)=>{
				//if(dodele[0].user.email == req.session.user.email){
					var setObj	=	{ $set: {
								majstorZavrsio: 1,
								vremeZavrsetkaRadova: new Date().getTime()
							}};
					dodeljivaniNaloziDB.updateOne({uniqueId:req.body.id},setObj)
					.then((dbResponse) => {
						io.emit("majstorZavrsio",req.body.id)
						res.redirect("/nalog/"+dodele[0].nalog)
					})
					.catch((error)=>{
						logError(error);
						res.render("message",{
							pageTitle: "Грешка",
							message: "<div class=\"text\">Грешка у бази података 4827.</div>",
							user: req.session.user
						});
					})
				//}else{
					//res.render("message",{
						//pageTitle: "Грешка",
						//message: "<div class=\"text\">Не можете мењати туђу доделу.</div>",
						//user: req.session.user
					//});
				//}
			})
			.catch((error)=>{
				logError(error);
				res.render("message",{
					pageTitle: "Грешка",
					message: "<div class=\"text\">Грешка у бази података 4821.</div>",
					user: req.session.user
				});
			})
		}else{
			res.render("message",{
				pageTitle: "Грешка",
				message: "<div class=\"text\">Ваш налог није овлашћен да мења статус доделе.</div>",
				user: req.session.user
			});
		}
	}else{
		res.redirect("/login")
	}
});


server.get('/pretragaNaloga',async (req,res)=>{
	if(req.session.user){
		res.render("pretragaNaloga",{
			pageTitle:"Претрага налога",
			user: req.session.user
		});
	}else{
		res.redirect("/login?url="+encodeURIComponent(req.url));
	}
});

server.get('/pretragaFaktura',async (req,res)=>{
	if(req.session.user){
		res.render("pretragaFaktura",{
			pageTitle:"Претрага фактура",
			user: req.session.user
		});
	}else{
		res.redirect("/login?url="+encodeURIComponent(req.url));
	}
});

server.get('/nalog/:broj/:accesscode/:user',async (req,res)=>{
	if(req.params.accesscode==phoneAccessCode){
		naloziDB.find({broj:req.params.broj.toString()}).toArray()
			.then((nalozi) => {
				if(nalozi.length>0){
					usersDB.find({email:decodeURIComponent(req.params.user)}).toArray()
					.then((korisnici)=>{
						if(korisnici.length>0){
							var korisnik = korisnici[0];
							delete korisnik._id;
							delete korisnik.password;
							res.render("nalogMobilni",{
								korisnik: korisnik,
								pageTitle:"Налог број "+req.params.broj,
								nalog: nalozi[0]
							});
						}else{
							res.render("messageNotLoggedIn",{
								pageTitle: "Нерегистрован корисник",
								message: "<div class=\"text\">Нерегистровани корисници не могу приступити налозима.</div>"
							});
						}
					})
					.catch((error)=>{
						logError(error);
						res.render("messageNotLoggedIn",{
							pageTitle: "Програмска грешка",
							message: "<div class=\"text\">Дошло је до грешке у бази податка 665.</div>"
						});
					})
				}else{
					res.render("messageNotLoggedIn",{
						pageTitle: "Непостојећи налог",
						message: "<div class=\"text\">Налог број "+req.params.broj+" не постоји.</div>"
					});
				}
			})
			.catch((error)=>{
				logError(error);
				res.render("messageNotLoggedIn",{
					pageTitle: "Програмска грешка",
					message: "<div class=\"text\">Дошло је до грешке у бази податка 662.</div>"
				});
			})
	}else{
		res.render("messageNotLoggedIn",{
			pageTitle: "Истекао код",
			message: "<div class=\"text\">Код за приступ налогу преко телефона је истекао. Отворите налог на компјутеру и скенирајте поново.</div>"
		});
	}
});

server.post('/izvestaj-sa-mobilnog', async (req, res)=> {
		uploadSlika(req, res, function (error) {
		    if (error) {
		      logError(error);
		      return res.render("messageNotLoggedIn",{pageTitle: "Програмска грешка",message: "<div class=\"text\">Дошло је до грешке у обради фотографија.</div>"});
		    }
		    var json = JSON.parse(req.body.json);
		    var izvestajJson = {};
		    izvestajJson.uniqueId 	=	new Date().getTime() +"--"+generateId(5);
		    izvestajJson.nalog			=	json.broj;
		    izvestajJson.datetime 	=	new Date().getTime();
		    izvestajJson.datum			=	getDateAsStringForDisplay(new Date(Number(izvestajJson.datetime)));
		    izvestajJson.izvestaj		=	json.izvestaj;
		    izvestajJson.user 			=	json.korisnik;
		    izvestajJson.photos			=	[];
		    for(var i=0;i<req.files.length;i++){
		    	izvestajJson.photos.push(req.files[i].transforms[0].location)
		    }
		    if(izvestajJson.izvestaj!="" || izvestajJson.photos.length>0){
		    	izvestajiDB.insertOne(izvestajJson)
					.then((dbResponse)=>{
						res.redirect("/uspesanIzvestaj");
					})
					.catch((error)=>{
						logError(error);
						res.render("messageNotLoggedIn",{
							pageTitle: "Програмска грешка",
							message: "<div class=\"text\">Дошло је до грешке у бази податка 731.</div>"
						});
					})
		    }else{
		    	res.render("messageNotLoggedIn",{
						pageTitle: "Грешка",
						message: "<div class=\"text\">Сервер није детектовао ни слике ни извештај.</div>"
					});
		    }
		});
});

server.get('/uspesanIzvestaj',async (req,res)=>{
	res.render("messageNotLoggedIn",{
		pageTitle: "Извештај окачен",
		message: "<div class=\"text\">Ваш извештај је успешно окачен.</div>"
	});
});

server.post('/edit-nalog', async (req, res)=> {
	if(req.session.user){
		if(Number(req.session.user.role)==10 || Number(req.session.user.role)==20 || Number(req.session.user.role)==25 || Number(req.session.user.role)==30){
				uploadSlika(req, res, async function (error) {
			    if (error) {
			      logError(error);
			      return res.render("message",{pageTitle: "Грешка",message: "<div class=\"text\">Дошло је до грешке приликом качења слика.</div>",user: req.session.user});
			    }
			    var nalogJson = JSON.parse(req.body.json);
			    //console.log(nalogJson);
			    var izvestajJson = {};
			    izvestajJson.uniqueId 	=	new Date().getTime() +"--"+generateId(5);
			    izvestajJson.nalog		=	nalogJson.broj;
			    izvestajJson.nalogId	=	nalogJson.nalogId;
			    izvestajJson.datetime 	=	new Date().getTime();
			    izvestajJson.datum		=	getDateAsStringForDisplay(new Date(Number(izvestajJson.datetime)));
			    izvestajJson.izvestaj	=	nalogJson.izvestaj;
			    izvestajJson.user 		=	req.session.user;
			    izvestajJson.photos		=	[];
			    for(var i=0;i<req.files.length;i++){
			    	izvestajJson.photos.push(req.files[i].transforms[0].location)
			    }

					if( nalogJson.obracunatNaPortalu==nalogJson.stariNalog.obracunatNaPortalu && nalogJson.status==nalogJson.stariNalog.statusNaloga && nalogJson.majstor==nalogJson.stariNalog.majstor && JSON.stringify(nalogJson.kategorijeRadova)==JSON.stringify(nalogJson.stariNalog.kategorijeRadova) && JSON.stringify(nalogJson.obracun)==JSON.stringify(nalogJson.stariNalog.obracun)){
						//nema izmena na nalogu
						if(izvestajJson.izvestaj!="" || izvestajJson.photos.length>0){
							//ima izvestaja
							try{
								await izvestajiDB.insertOne(izvestajJson);
								res.redirect("/nalog/"+nalogJson.broj);
							}catch(err){
								logError(err);
								res.render("message",{
									pageTitle: "Програмска грешка",
									user:req.session.user,
									message: "<div class=\"text\">Дошло је до грешке у бази податка 2634.</div>"
								});
							}
						}else{
							//nema izvestaja i nema izmena na nalogu
							res.redirect("/nalog/"+nalogJson.broj);
						}
					}else{
						//ima izmena na nalogu
						if(izvestajJson.izvestaj!="" || izvestajJson.photos.length>0){
							//ima izvestaja
							try{
								await izvestajiDB.insertOne(izvestajJson);
								var ukupanIznos = 0;
								for(var i=0;i<nalogJson.obracun.length;i++){
									if(!nalogJson.obracun[i].price){
										for(var j=0;j<cenovnik.length;j++){
											if(nalogJson.obracun[i].code==cenovnik[j].code){
												ukupanIznos = ukupanIznos + cenovnik[j].price*nalogJson.obracun[i].quantity;
												break;
											}
										}
									}else{
										ukupanIznos = ukupanIznos + parseFloat(nalogJson.obracun[i].price);
									}
								}
								var setObj	=	{ $set: {
									statusNaloga: nalogJson.status,
									majstor: nalogJson.majstor,
									obracun: nalogJson.obracun,
									//kategorijeRadova: nalogJson.kategorijeRadova,
									ukupanIznos: ukupanIznos,
									obracunatNaPortalu: nalogJson.obracunatNaPortalu,
									izmenio: req.session.user
								}};

								var nalozi2024 = await nalozi2024DB.find({broj:nalogJson.broj}).toArray();
								if(nalozi2024.length>0){
									await nalozi2024DB.updateOne({broj:nalogJson.broj},setObj);
								}else{
									await naloziDB.updateOne({broj:nalogJson.broj},setObj);
								}
								
								nalogJson.stariNalog.izmenio = req.session.user;
								nalogJson.stariNalog.datetime = new Date().getTime();
								await istorijaNalogaDB.insertOne(nalogJson.stariNalog);
								res.redirect("/nalog/"+nalogJson.broj);
							}catch(err){
								logError(err);
								res.render("message",{
									pageTitle: "Програмска грешка",
									user:req.session.user,
									message: "<div class=\"text\">Дошло је до грешке у бази податка 2634.</div>"
								});
							}
						}else{
							//nema izvestaja
							try{
								var ukupanIznos = 0;
								for(var i=0;i<nalogJson.obracun.length;i++){
									if(!nalogJson.obracun[i].price){
										for(var j=0;j<cenovnik.length;j++){
											if(nalogJson.obracun[i].code==cenovnik[j].code){
												ukupanIznos = ukupanIznos + cenovnik[j].price*nalogJson.obracun[i].quantity;
												break;
											}
										}
									}else{
										ukupanIznos = ukupanIznos + parseFloat(nalogJson.obracun[i].price);
									}
								}
								var setObj	=	{ $set: {
									statusNaloga: nalogJson.status,
									majstor: nalogJson.majstor,
									obracun: nalogJson.obracun,
									//kategorijeRadova: nalogJson.kategorijeRadova,
									obracunatNaPortalu: nalogJson.obracunatNaPortalu,
									ukupanIznos: ukupanIznos,
									izmenio: req.session.user
								}};

								var nalozi2024 = await nalozi2024DB.find({broj:nalogJson.broj}).toArray();
								if(nalozi2024.length>0){
									await nalozi2024DB.updateOne({broj:nalogJson.broj},setObj);
								}else{
									await naloziDB.updateOne({broj:nalogJson.broj},setObj);
								}
								nalogJson.stariNalog.izmenio = req.session.user;
								nalogJson.stariNalog.datetime = new Date().getTime();
								await istorijaNalogaDB.insertOne(nalogJson.stariNalog);
								if(nalogJson.stariNalog.status == "Vraćen" && nalogJson.status=="Završeno"){
									var mailOptions = {
										from: '"ВиК Портал Послова Града" <admin@poslovigrada.rs>',
										to: 'marija.slijepcevic@poslovigrada.rs',
										subject: 'Завршен враћен налог '+nalogJson.broj,
										html: 'Ћао Марија,<br>Враћен налог подизвођача је поново завршен.<br>Број налога: <a href=\"'+process.env.siteurl+'/nalog/'+nalogJson.broj+'\">'+nalogJson.broj+'</a><br>Позз.',
									};

									transporter.sendMail(mailOptions, (error, info) => {
										if (error) {
											logError(error);
											res.redirect("/nalog/"+nalogJson.broj);
										}else{
											res.redirect("/nalog/"+nalogJson.broj);
										}
									});
								}else{
									res.redirect("/nalog/"+nalogJson.broj);
								}

							}catch(err){
								logError(err);
								res.render("message",{
									pageTitle: "Програмска грешка",
									user:req.session.user,
									message: "<div class=\"text\">Дошло је до грешке у бази податка 2634.</div>"
								});
							}
						}
					}
				});
			
		}else{
			res.render("message",{
				pageTitle: "Програмска грешка",
				user:req.session.user,
				message: "<div class=\"text\">Није дефинисан ниво корисника.</div>"
			});
		}
	}else{
		res.redirect("/login");
	}
});

server.post('/edit-nalog-kontrolor', async (req, res)=> {
	if(req.session.user){
		if(Number(req.session.user.role)==25){
			uploadSlika(req, res, function (error) {
			    if (error) {
			      logError(error);
			      return res.render("message",{pageTitle: "Грешка",message: "<div class=\"text\">Дошло је до грешке приликом качења слика.</div>",user: req.session.user});
			    }
			    var nalogJson = JSON.parse(req.body.json);
			    var izvestajJson = {};
			    izvestajJson.uniqueId 	=	new Date().getTime() +"--"+generateId(5);
			    izvestajJson.nalog		=	nalogJson.broj;
			    izvestajJson.datetime 	=	new Date().getTime();
			    izvestajJson.datum		=	getDateAsStringForDisplay(new Date(Number(izvestajJson.datetime)));
			    izvestajJson.izvestaj	=	nalogJson.izvestaj;
			    izvestajJson.user 		=	req.session.user;
			    izvestajJson.photos		=	[];
			    for(var i=0;i<req.files.length;i++){
			    	izvestajJson.photos.push(req.files[i].transforms[0].location)
			    }

			    izvestajiDB.insertOne(izvestajJson)
					.then((dbResponse)=>{
						res.redirect("/nalog/"+nalogJson.broj);
					})
					.catch((error)=>{
						logError(error);
						res.render("message",{
							pageTitle: "Програмска грешка",
							user:req.session.user,
							message: "<div class=\"text\">Дошло је до грешке у бази податка 676.</div>"
						});
					})
				});
		}else{
			res.send("Nije definisan nivo korisnika");
		}
	}else{
		res.redirect("/login");
	}
});

server.post('/izmena-dispecera', async (req, res)=> {
	if(req.session.user){
		if(Number(req.session.user.role)==10){
			var json = JSON.parse(req.body.json);
			var setObj	=	{ $set: {
				opstine: json.opstine
			}};
			usersDB.updateOne({email:json.dispecer},setObj)
			.then((dbResponse2) => {
				res.redirect("/dispeceri")
			})
			.catch(error=>{
				logError(error);
				res.render("message",{
					pageTitle: "Програмска грешка",
					user: req.session.user,
					message: "<div class=\"text\">Дошло је до грешке у бази податка 194.</div>"
				});
			})
		}else{
			res.render("message",{
				pageTitle: "Грешка",
				user: req.session.user,
				message: "<div class=\"text\">Ваш кориснички налог није овлашћен да прави измене диспечера.</div>",
				user: req.session.user
			});
		}
	}else{
		res.redirect("/login");	
	}
});

server.post('/ucinakMajstora', async (req, res)=> {
	if(req.session.user){
		if(Number(req.session.user.role)==10){
			var json = JSON.parse(req.body.json);
			if(json.uniqueId=="new"){
				//novi ucinak
				json.uniqueId = new Date().getTime()+"--"+generateId(6);
				delete json.id;
				ucinakMajstoraDB.insertOne(json)
				.then((dbResponse)=>{
					res.redirect("/nalog/"+json.brojNaloga);
				})
				.catch((error)=>{
					logError(error);
					res.render("message",{
						pageTitle: "Програмска грешка",
						user: req.session.user,
						message: "<div class=\"text\">Дошло је до грешке у бази податка 731.</div>"
					});
				})
			}else{
				//edit exiting
				var setObj	=	{ $set: {
					datum: json.datum,
					majstor: json.majstor,
					obracun: json.obracun,
					ukupanIznos: json.ukupanIznos
				}};

				ucinakMajstoraDB.updateOne({uniqueId:json.uniqueId},setObj)
				.then((dbResponse)=>{
					res.redirect("/nalog/"+json.brojNaloga);
				})
				.catch((error)=>{
					logError(error);
					res.render("message",{
						pageTitle: "Програмска грешка",
						message: "<div class=\"text\">Дошло је до грешке у бази податка 1725.</div>",
						user: req.session.user
					});
				})
			}
		}else{
			res.render("message",{
				pageTitle: "Грешка",
				message: "<div class=\"text\">Ваш кориснички налог није овлашћен да прави учинке за мајсторе.</div>",
				user: req.session.user
			});
		}
	}else{
		res.redirect("/login");	
	}
});

server.post('/obrisiUcinakMajstora', async (req, res)=> {
	if(req.session.user){
		if(Number(req.session.user.role)==10){
			var json = JSON.parse(req.body.json);
				ucinakMajstoraDB.deleteOne({uniqueId:json.id})
				.then((dbResponse)=>{
					res.redirect("/nalog/"+json.brojNaloga);
				})
				.catch((error)=>{
					logError(error);
					res.render("message",{
						pageTitle: "Програмска грешка",
						user: req.session.user,
						message: "<div class=\"text\">Дошло је до грешке у бази податка 985.</div>"
					});
				})
		}else{
			res.render("message",{
				pageTitle: "Грешка",
				message: "<div class=\"text\">Ваш кориснички налог није овлашћен да брише учинке за мајсторе.</div>",
				user: req.session.user
			});
		}
	}else{
		res.redirect("/login");	
	}
});

server.get('/dispeceri',async (req,res)=>{
	if(req.session.user){
		if(Number(req.session.user.role)==10){
			usersDB.find({role:"20"}).toArray()
			.then((users)=>{
				for(var i=0;i<users.length;i++){
					delete users[i].passowrd;
					delete users[i]._id;
				}
				res.render("administracija/dispeceri",{
					pageTitle:"Диспечери",
					dispeceri: users,
					user: req.session.user
				});
			})
			.catch((error)=>{
				logError(error);
				res.render("message",{
					pageTitle: "Грешка",
					message: "<div class=\"text\">Дошло је до грешке у бази податка 706.</div>",
					user: req.session.user
				});
			})
			
		}else{
			res.render("message",{
				pageTitle: "Грешка",
				message: "<div class=\"text\">Ваш кориснички налог није овлашћен да види ову страницу.</div>",
				user: req.session.user
			});
		}
		
	}else{
		res.redirect("/login?url="+encodeURIComponent(req.url));
	}
});

server.get('/administracijaMajstora',async (req,res)=>{
	if(req.session.user){
		if(Number(req.session.user.role)==10 || Number(req.session.user.role)==20){
			majstoriDB.find({}).toArray()
			.then((majstori)=>{
				for (var i = majstori.length - 1; i >= 0; i--) {
			    if (podizvodjaci.indexOf(majstori[i].uniqueId) >= 0) {
			      majstori.splice(i, 1); 
			    }
				}
				pomocniciDB.find({}).toArray()
				.then((pomocnici)=>{
					usersDB.find({}).toArray()
					.then((users)=>{
						for(var i=0;i<users.length;i++){
							delete users[i].password;
							delete users[i].resetPassDate;
							delete users[i].resetPassId;
							delete users[i].resetPassTime;
							delete users[i]._id;
						}
						res.render("administracija/administracijaMajstora",{
							pageTitle:"Администрација мајстора",
							majstori: majstori,
							pomocnici: pomocnici,
							users: users,
							user: req.session.user
						});
					})
					.catch((error)=>{
						logError(error);
						res.render("message",{
							pageTitle: "Програмска грешка",
							user: req.session.user,
							message: "<div class=\"text\">Дошло је до грешке у бази податка 4802.</div>"
						});
					})
				})
				.catch((error)=>{
					logError(error);
					res.render("message",{
						pageTitle: "Програмска грешка",
						user: req.session.user,
						message: "<div class=\"text\">Дошло је до грешке у бази податка 5770.</div>"
					});
				})
			})
			.catch((error)=>{
				
			})
		}else{
			res.render("message",{
				pageTitle: "Грешка",
				user: req.session.user,
				message: "<div class=\"text\">Ваш налог није овлашћен да види ову страницу.</div>"
			});
		}
	}else{
		res.redirect("/login?url="+encodeURIComponent(req.url))
	}
});

server.get('/administracijaMajstora/:id',async (req,res)=>{
	if(req.session.user){
		if(Number(req.session.user.role)==10 || Number(req.session.user.role)==20){
			usersDB.find({role:"25"}).toArray()
			.then((nadzori)=>{
				majstoriDB.find({uniqueId:req.params.id}).toArray()
				.then((majstori)=>{
					if(majstori.length>0){
						res.render("administracija/administracijaMajstoraEdit",{
							pageTitle: "Администрација помоћника",
							type: "Мајстор",
							nadzori: nadzori,
							majstor: majstori[0],
							user: req.session.user
						});
					}else{
						pomocniciDB.find({uniqueId:req.params.id}).toArray()
						.then((pomocnici)=>{
							if(pomocnici.length>0){
								res.render("administracija/administracijaMajstoraEdit",{
									pageTitle: "Администрација помоћника",
									type: "Помоћник",
									nadzori: nadzori,
									majstor: pomocnici[0],
									user: req.session.user
								});
							}else{
								res.render("message",{
									pageTitle: "Грешка",
									user: req.session.user,
									message: "<div class=\"text\">Непостојећи мајстор.</div>"
								});
							}
						})
						.catch((error)=>{
							logError(error);
							res.render("message",{
								pageTitle: "Програмска грешка",
								user: req.session.user,
								message: "<div class=\"text\">Дошло је до грешке у бази податка 5816.</div>"
							});
						})
					}
				})
				.catch((error)=>{
					logError(error);
					res.render("message",{
						pageTitle: "Програмска грешка",
						user: req.session.user,
						message: "<div class=\"text\">Дошло је до грешке у бази податка 5840.</div>"
					});
				})
			})
			.catch((error)=>{
				logError(error);
				res.render("message",{
					pageTitle: "Програмска грешка",
					user: req.session.user,
					message: "<div class=\"text\">Дошло је до грешке у бази податка 5816.</div>"
				});
			})
			
		}else{
			res.render("message",{
				pageTitle: "Грешка",
				user: req.session.user,
				message: "<div class=\"text\">Ваш налог није овлашћен да види ову страницу.</div>"
			});
		}
	}else{
		res.redirect("/login?url="+encodeURIComponent(req.url))
	}
});

server.get('/administracijaAdministracije/:mail',async (req,res)=>{
	if(req.session.user){
		if(Number(req.session.user.role)==10){
			usersDB.find({role:"25"}).toArray()
			.then((nadzori)=>{
				usersDB.find({email:decodeURIComponent(req.params.mail)}).toArray()
				.then((users)=>{
					if(users.length>0){
						res.render("administracija/administracijaRadnikaEdit",{
							pageTitle: "Администрација радника",
							radnik: users[0],
							nadzori: nadzori,
							user: req.session.user
						});
					}else{
						res.render("message",{
							pageTitle: "Грешка",
							user: req.session.user,
							message: "<div class=\"text\">Непосотјећи радник.</div>"
						});
					}
					
				})
				.catch((error)=>{
					logError(error);
					res.render("message",{
						pageTitle: "Програмска грешка",
						user: req.session.user,
						message: "<div class=\"text\">Дошло је до грешке у бази податка 5840.</div>"
					});
				})
			})
			.catch((error)=>{
				logError(error);
				res.render("message",{
					pageTitle: "Програмска грешка",
					user: req.session.user,
					message: "<div class=\"text\">Дошло је до грешке у бази податка 5840.</div>"
				});
			})
			
		}else{
			res.render("message",{
				pageTitle: "Грешка",
				user: req.session.user,
				message: "<div class=\"text\">Ваш налог није овлашћен да види ову страницу.</div>"
			});
		}
	}else{
		res.redirect("/login?url="+encodeURIComponent(req.url))
	}
});

//ceo maj odgusenja

server.post('/izmenaMajstora',async (req,res)=>{
	if(req.session.user){
		if(Number(req.session.user.role)==10 || Number(req.session.user.role)==20){
			var json = JSON.parse(req.body.json);
			var setObj	=	{ $set: {
											brojKartice:json.brojKartice,
											ime:json.ime,
											ocekivaniUcinak:json.ocekivaniUcinak,
											mesecnaPlata:json.mesecnaPlata,
											sluzbeniBroj:json.sluzbeniBroj,
											privatniBroj:json.privatniBroj,
											jmbg:json.jmbg,
											brojLicneKarte:json.brojLicneKarte,
											adresaStanovanja:json.adresaStanovanja,
											odgovornoLice:json.odgovornoLice,
											beleske:json.beleske,
											aktivan:json.aktivan,
											vezaSaStarimPortalom:json.vezaSaStarimPortalom,
											tipRada:json.tipRada,
											username:json.username,
											password: hashString(json.actualPassword),
											actualPassword: json.actualPassword,
										}
								};

			if(json.tip=="Мајстор"){
				majstoriDB.updateOne({uniqueId:json.uniqueId},setObj)
				.then((dbResponse)=>{
					res.redirect("/administracijaMajstora/"+json.uniqueId);
				})
				.catch((error)=>{
					logError(error);
					res.render("message",{
						pageTitle: "Програмска грешка",
						user: req.session.user,
						message: "<div class=\"text\">Дошло је до грешке у бази податка 5884.</div>"
					})
				})
			}else{
				pomocniciDB.updateOne({uniqueId:json.uniqueId},setObj)
				.then((dbResponse)=>{
					res.redirect("/administracijaMajstora/"+json.uniqueId);
				})
				.catch((error)=>{
					logError(error);
					res.render("message",{
						pageTitle: "Програмска грешка",
						user: req.session.user,
						message: "<div class=\"text\">Дошло је до грешке у бази податка 5884.</div>"
					})
				})
			}
			
		}else{
			res.render("message",{
				pageTitle: "Грешка",
				user: req.session.user,
				message: "<div class=\"text\">Ваш налог није овлашћен да прави измене мајстора.</div>"
			});
		}
	}else{
		res.redirect("/login?url="+encodeURIComponent(req.url))
	}
});

server.post('/brisanjeMajstora',async (req,res)=>{
	if(req.session.user){
		if(Number(req.session.user.role)==10){
			var json = JSON.parse(req.body.json);
			if(json.tip=="Мајстор"){
				majstoriDB.deleteOne({uniqueId:json.uniqueId})
				.then((dbResponse)=>{
					res.redirect("/administracijaMajstora");
				})
				.catch((error)=>{
					logError(error);
					res.render("message",{
						pageTitle: "Програмска грешка",
						user: req.session.user,
						message: "<div class=\"text\">Дошло је до грешке у бази податка 4892.</div>"
					})
				})
			}else{
				pomocniciDB.deleteOne({uniqueId:json.uniqueId})
				.then((dbResponse)=>{
					res.redirect("/administracijaMajstora/");
				})
				.catch((error)=>{
					logError(error);
					res.render("message",{
						pageTitle: "Програмска грешка",
						user: req.session.user,
						message: "<div class=\"text\">Дошло је до грешке у бази податка 5884.</div>"
					})
				})
			}
			
		}else{
			res.render("message",{
				pageTitle: "Грешка",
				user: req.session.user,
				message: "<div class=\"text\">Ваш налог није овлашћен да прави измене мајстора.</div>"
			});
		}
	}else{
		res.redirect("/login?url="+encodeURIComponent(req.url))
	}
});

server.get('/dodajMajstora',async (req,res)=>{
	if(req.session.user){
		if(Number(req.session.user.role)==10){
			res.render("administracija/dodajMajstora",{
				pageTitle: "Додавање Мајстора",
				type: "Мајстор",
				user: req.session.user
			});
		}else{
			res.render("message",{
				pageTitle: "Грешка",
				user: req.session.user,
				message: "<div class=\"text\">Ваш налог није овлашћен да види ову страницу.</div>"
			});
		}
	}else{
		res.redirect("/login?url="+encodeURIComponent(req.url))
	}
});

server.get('/dodajPomocnika',async (req,res)=>{
	if(req.session.user){
		if(Number(req.session.user.role)==10){
			res.render("administracija/dodajMajstora",{
				pageTitle: "Додавање помоћника",
				type: "Помоћник",
				user: req.session.user
			});
		}else{
			res.render("message",{
				pageTitle: "Грешка",
				user: req.session.user,
				message: "<div class=\"text\">Ваш налог није овлашћен да види ову страницу.</div>"
			});
		}
	}else{
		res.redirect("/login?url="+encodeURIComponent(req.url))
	}
});

server.post('/dodavanjeMajstora',async (req,res)=>{
	if(req.session.user){
		if(Number(req.session.user.role)==10){
			var json = JSON.parse(req.body.json);

			var majstorJson = {};
			majstorJson.brojKartice = json.brojKartice;
			majstorJson.ime = json.ime;
			majstorJson.tip = json.tip
			majstorJson.ocekivaniUcinak = json.ocekivaniUcinak;
			majstorJson.sluzbeniBroj = json.sluzbeniBroj;
			majstorJson.privatniBroj = json.privatniBroj;
			majstorJson.jmbg = json.jmbg;
			majstorJson.brojLicneKarte = json.brojLicneKarte;
			majstorJson.adresaStanovanja = json.adresaStanovanja;
			majstorJson.beleske = json.beleske;
			majstorJson.aktivan = json.aktivan;
			majstorJson.vezaSaStarimPortalom = json.vezaSaStarimPortalom;
			majstorJson.tipRada = json.tipRada;
			majstorJson.uniqueId = generateId(7)+"--"+new Date().getTime();
			if(json.tip=="Мајстор"){
				majstoriDB.insertOne(majstorJson)
				.then((dbResponse)=>{
					res.redirect("/administracijaMajstora");
				})
				.catch((error)=>{
					logError(error);
					res.render("message",{
						pageTitle: "Програмска грешка",
						user: req.session.user,
						message: "<div class=\"text\">Дошло је до грешке у бази податка 5884.</div>"
					})
				})
			}else{
				pomocniciDB.insertOne(majstorJson)
				.then((dbResponse)=>{
					res.redirect("/administracijaMajstora");
				})
				.catch((error)=>{
					logError(error);
					res.render("message",{
						pageTitle: "Програмска грешка",
						user: req.session.user,
						message: "<div class=\"text\">Дошло је до грешке у бази податка 5884.</div>"
					})
				})
			}
			
		}else{
			res.render("message",{
				pageTitle: "Грешка",
				user: req.session.user,
				message: "<div class=\"text\">Ваш налог није овлашћен да прави измене мајстора.</div>"
			});
		}
	}else{
		res.redirect("/login?url="+encodeURIComponent(req.url))
	}
});



server.post('/izmenaAdministracije',async (req,res)=>{
	if(req.session.user){
		if(Number(req.session.user.role)==10){
			var json = JSON.parse(req.body.json);
			var setObj	=	{ $set: {
											brojKartice:json.brojKartice,
											sluzbeniBroj:json.sluzbeniBroj,
											privatniBroj:json.privatniBroj,
											jmbg:json.jmbg,
											brojLicneKarte:json.brojLicneKarte,
											adresaStanovanja:json.adresaStanovanja,
											odgovornoLice:json.odgovornoLice
										}
								};

				usersDB.updateOne({email:json.email},setObj)
				.then((dbResponse)=>{
					res.redirect("/administracijaAdministracije/"+encodeURIComponent(json.email));
				})
				.catch((error)=>{
					logError(error);
					res.render("message",{
						pageTitle: "Програмска грешка",
						user: req.session.user,
						message: "<div class=\"text\">Дошло је до грешке у бази податка 5884.</div>"
					})
				})
			
			
		}else{
			res.render("message",{
				pageTitle: "Грешка",
				user: req.session.user,
				message: "<div class=\"text\">Ваш налог није овлашћен да прави измене мајстора.</div>"
			});
		}
	}else{
		res.redirect("/login?url="+encodeURIComponent(req.url))
	}
});


server.get('/zavrseniNaloziPodizvodjaca',async (req,res)=>{
	if(req.session.user){
		if(Number(req.session.user.role)==10){
			try{
				var nalozi = await naloziDB.find({statusNaloga:"Završeno"}).toArray();
				var nalozi2024 = await nalozi2024DB.find({statusNaloga:"Završeno"}).toArray();
				for(var i=0;i<nalozi2024.length;i++){
					nalozi.push(nalozi2024[i])
				}
				var majstori = await majstoriDB.find({}).toArray();
				res.render("administracija/zavrseniNaloziPodizvodjaca",{
					pageTitle:"Завршени налози подизвођача",
					nalozi: nalozi,
					cenovnik: cenovnik,
					majstori: majstori,
					user: req.session.user
				});

			}catch(err){
				logError(err);
				res.render("message",{
					pageTitle: "Програмска грешка",
					user: req.session.user,
					message: "<div class=\"text\">Дошло је до грешке у бази податка 7743.</div>"
				});
			}
		}else{
			res.render("message",{
				pageTitle: "Грешка",
				user: req.session.user,
				message: "<div class=\"text\">Ваш налог није овлашћен да види ову страницу.</div>"
			});
		}
	}else{
		res.redirect("/login?url="+encodeURIComponent(req.url))
	}
});

server.get('/vraceniNaloziPodizvodjaca',async (req,res)=>{
	if(req.session.user){
		if(Number(req.session.user.role)==10){
			try{
				var nalozi = await naloziDB.find({statusNaloga:"Vraćen"}).toArray();
				var nalozi2024 = await nalozi2024DB.find({statusNaloga:"Vraćen"}).toArray();
				for(var i=0;i<nalozi2024.length;i++){
					nalozi.push(nalozi2024[i])
				}

				var majstori = await majstoriDB.find({}).toArray();
				res.render("administracija/vraceniNaloziPodizvodjaca",{
					pageTitle:"Враћени налози подизвођача",
					nalozi: nalozi,
					cenovnik: cenovnik,
					majstori: majstori,
					user: req.session.user
				})
			}catch(err){
				logError(err);
				res.render("message",{
					pageTitle: "Програмска грешка",
					user: req.session.user,
					message: "<div class=\"text\">Дошло је до грешке у бази податка 2193.</div>"
				});
			}
		}else{
			res.render("message",{
				pageTitle: "Грешка",
				user: req.session.user,
				message: "<div class=\"text\">Ваш налог није овлашћен да види ову страницу.</div>"
			});
		}
	}else{
		res.redirect("/login?url="+encodeURIComponent(req.url))
	}
});

server.get('/otvoreniNaloziPodizvodjaca',async (req,res)=>{
	if(req.session.user){
		if(Number(req.session.user.role)==10){
			try{
				var nalozi = await naloziDB.find({statusNaloga:{$nin:["Vraćen","Storniran","Fakturisan","Završeno","Spreman za fakturisanje",""]}}).toArray();
				var nalozi2024 = await nalozi2024DB.find({statusNaloga:{$nin:["Vraćen","Storniran","Fakturisan","Završeno","Spreman za fakturisanje",""]}}).toArray();
				for(var i=0;i<nalozi2024.length;i++){
					nalozi.push(nalozi2024[i])
				}
				var majstori = await majstoriDB.find({}).toArray();
				res.render("administracija/zavrseniNaloziPodizvodjaca",{
					pageTitle:"Додељени налози подизвођача",
					nalozi: nalozi,
					cenovnik: cenovnik,
					majstori: majstori,
					user: req.session.user
				})
			}catch(err){
				logError(err);
				res.render("message",{
					pageTitle: "Програмска грешка",
					user: req.session.user,
					message: "<div class=\"text\">Дошло је до грешке у бази податка 2193.</div>"
				});
			}
		}else{
			res.render("message",{
				pageTitle: "Грешка",
				user: req.session.user,
				message: "<div class=\"text\">Ваш налог није овлашћен да види ову страницу.</div>"
			});
		}
	}else{
		res.redirect("/login?url="+encodeURIComponent(req.url))
	}
});


server.get('/jucerasnjiNaloziPodizvodjaca',async (req,res)=>{
	if(req.session.user){
		if(Number(req.session.user.role)==10){
			var yesterday = new Date()
			yesterday.setDate(yesterday.getDate()-1);
			naloziDB.find({"datum.datum":getDateAsStringForDisplay(yesterday),majstor:{$in:podizvodjaci}}).toArray()
			.then((nalozi)=>{
				majstoriDB.find({uniqueId:{$in:podizvodjaci}}).toArray()
				.then((podizvodjaci)=>{
					res.render("administracija/jucerasnjiNaloziPodizvodjaca",{
						pageTitle:"Налози подизвођача на дан " + getDateAsStringForDisplay(yesterday),
						nalozi: nalozi,
						podizvodjaci: podizvodjaci,
						date: getDateAsStringForInputObject(yesterday),
						cenovnik: cenovnik,
						user: req.session.user
					})
				})
				.catch((error)=>{
					logError(error);
					res.render("message",{
						pageTitle: "Програмска грешка",
						user: req.session.user,
						message: "<div class=\"text\">Дошло је до грешке у бази податка 2193.</div>"
					});
				})
					
			})
			.catch((error)=>{
				logError(error);
				res.render("message",{
					pageTitle: "Програмска грешка",
					user: req.session.user,
					message: "<div class=\"text\">Дошло је до грешке у бази податка 2208.</div>"
				});
			})
		}else{
			res.render("message",{
				pageTitle: "Грешка",
				user: req.session.user,
				message: "<div class=\"text\">Ваш налог није овлашћен да види ову страницу.</div>"
			});
		}
	}else{
		res.redirect("/login?url="+encodeURIComponent(req.url))
	}
});

server.get('/jucerasnjiNaloziPodizvodjaca/:datum',async (req,res)=>{
	if(req.session.user){
		if(Number(req.session.user.role)==10){
			var date = new Date(req.params.datum)
			naloziDB.find({"datum.datum":getDateAsStringForDisplay(date),majstor:{$in:podizvodjaci}}).toArray()
			.then((nalozi)=>{
				majstoriDB.find({uniqueId:{$in:podizvodjaci}}).toArray()
				.then((podizvodjaci)=>{
					res.render("administracija/jucerasnjiNaloziPodizvodjaca",{
						pageTitle:"Налози подизвођача на дан " + getDateAsStringForDisplay(date),
						nalozi: nalozi,
						date: getDateAsStringForInputObject(date),
						podizvodjaci: podizvodjaci,
						cenovnik: cenovnik,
						user: req.session.user
					})
				})
				.catch((error)=>{
					logError(error);
					res.render("message",{
						pageTitle: "Програмска грешка",
						user: req.session.user,
						message: "<div class=\"text\">Дошло је до грешке у бази податка 2193.</div>"
					});
				})
					
			})
			.catch((error)=>{
				logError(error);
				res.render("message",{
					pageTitle: "Програмска грешка",
					user: req.session.user,
					message: "<div class=\"text\">Дошло је до грешке у бази податка 2208.</div>"
				});
			})
		}else{
			res.render("message",{
				pageTitle: "Грешка",
				user: req.session.user,
				message: "<div class=\"text\">Ваш налог није овлашћен да види ову страницу.</div>"
			});
		}
	}else{
		res.redirect("/login?url="+encodeURIComponent(req.url))
	}
});

server.get('/ucinakPodizvodjaca',async (req,res)=>{
	if(req.session.user){
		if(Number(req.session.user.role)==5 || Number(req.session.user.role)==10){
			majstoriDB.find({}).toArray()
			.then((majstori)=>{
				for(var i=0;i<majstori.length;i++){
					if(podizvodjaci.indexOf(majstori[i].uniqueId)<0){
						majstori.splice(i,1);
						i--;
					}
				}

				for(var i=0;i<majstori.length;i++){
					if(Number(majstori[i].inactive)==1){
						majstori.splice(i,1);
						i--;
					}
				}

				naloziDB.find({}).toArray()
				.then((nalozi)=>{
					for(var i=0;i<majstori.length;i++){
						majstori[i].ucinak = [{broj:"02.2024",ime:"Februar 2024",iznos:0,nalozi:0},{broj:"03.2024",ime:"Mart 2024",iznos:0,nalozi:0},{broj:"04.2024",ime:"April 2024",iznos:0,nalozi:0},{broj:"05.2024",ime:"Maj 2024",iznos:0,nalozi:0}]
						for(var j=0;j<nalozi.length;j++){
							if(nalozi[j].majstor==majstori[i].uniqueId){
								var iznosNaloga = isNaN(parseFloat(nalozi[j].ukupanIznos)) ? 0 : parseFloat(nalozi[j].ukupanIznos);
								for(var k=0;k<majstori[i].ucinak.length;k++){
									if(nalozi[j].prijemnica.datum.datum.includes(majstori[i].ucinak[k].broj)){
										majstori[i].ucinak[k].iznos = majstori[i].ucinak[k].iznos + iznosNaloga;
										majstori[i].ucinak[k].nalozi++;
									}
								}
							}
						}
					}
					res.render("administracija/ucinakPodizvodjaca",{
						pageTitle:"Учинак подизвођача",
						majstori: majstori,
						user: req.session.user
					})
				})
				.catch((error)=>{
					logError(error);
					res.render("message",{
						pageTitle: "Програмска грешка",
						user: req.session.user,
						message: "<div class=\"text\">Дошло је до грешке у бази податка 2997.</div>"
					});
				})
			})
			.catch((error)=>{
				logError(error);
				res.render("message",{
					pageTitle: "Програмска грешка",
					user: req.session.user,
					message: "<div class=\"text\">Дошло је до грешке у бази податка 2989.</div>"
				});
			})
		}else{
			res.render("message",{
				pageTitle: "Грешка",
				user: req.session.user,
				message: "<div class=\"text\">Ваш налог није овлашћен да види ову страницу.</div>"
			});
		}
		
	}else{
		res.redirect("/login?url="+encodeURIComponent(req.url))
	}
});

server.get('/fakturePodizvodjaca',async (req,res)=>{
	if(req.session.user){
		if(Number(req.session.user.role)==10){
			res.render("administracija/fakturePodizvodjaca",{
				pageTitle:"Фактуре подизвођача",
				user: req.session.user
			})
		}else{
			res.render("message",{
				pageTitle: "Грешка",
				user: req.session.user,
				message: "<div class=\"text\">Ваш налог није овлашћен да види ову страницу.</div>"
			});
		}
		
	}else{
		res.redirect("/login?url="+encodeURIComponent(req.url))
	}
});

server.get('/stefan/ucinakDispecera',async (req,res)=>{
	if(req.session.user){
		if(Number(req.session.user.role)==5){
			res.render("stefan/ucinakDispecera",{
				pageTitle:"Учинак диспечера",
				user: req.session.user
			})
		}else{
			res.render("message",{
				pageTitle: "Грешка",
				user: req.session.user,
				message: "<div class=\"text\">Ваш налог није овлашћен да види ову страницу.</div>"
			});
		}
	}else{
		res.redirect("/login?url="+encodeURIComponent(req.url));
	}
});

server.get('/izvestajMajstoraPick',async (req,res)=>{
	if(req.session.user){
		if(Number(req.session.user.role)==10){
			try{
				var yesterday = new Date();
				yesterday.setDate(yesterday.getDate()-1);
				res.redirect("/izvestajMajstoraPick/"+getDateAsStringForInputObject(yesterday));
			}catch(err){
				logError(err);
				res.render("message",{
					pageTitle: "Програмска грешка",
					user: req.session.user,
					message: "<div class=\"text\">Дошло је до грешке у бази податка 7345.</div>"
				});
			}
		}else{
			res.render("message",{
				pageTitle: "Грешка",
				user: req.session.user,
				message: "<div class=\"text\">Ваш налог није овлашћен да види ову страницу.</div>"
			});
		}
	}else{
		res.redirect("/login?url="+encodeURIComponent(req.url));
	}
});

server.get('/izvestajMajstoraPick/:date',async (req,res)=>{
	if(req.session.user){
		if(Number(req.session.user.role)==10){
			try{
				//req.params.date je za izvestaje koji postoje
				var majstori = await majstoriDB.find({uniqueId:{$nin:podizvodjaci},aktivan:true}).toArray();
				var izvestaji = await dnevniIzvestajiDB.find({date:getDateAsStringForInputObject(new Date(req.params.date))}).toArray();
				res.render("administracija/izvestajMajstoraPick",{
					pageTitle:"Одабери мајстора и датум",
					user: req.session.user,
					majstori: majstori,
					izvestaji: izvestaji,
					date: req.params.date
				})
			}catch(err){
				logError(err);
				res.render("message",{
					pageTitle: "Програмска грешка",
					user: req.session.user,
					message: "<div class=\"text\">Дошло је до грешке у бази податка 7345.</div>"
				});
			}
		}else{
			res.render("message",{
				pageTitle: "Грешка",
				user: req.session.user,
				message: "<div class=\"text\">Ваш налог није овлашћен да види ову страницу.</div>"
			});
		}
	}else{
		res.redirect("/login?url="+encodeURIComponent(req.url));
	}
});



server.get('/izvestajMajstora/:majstorId/:date',async (req,res)=>{
	if(req.session.user){
		if(Number(req.session.user.role)==10){
			try{
				var majstori = await majstoriDB.find({uniqueId:req.params.majstorId}).toArray();
				var majstor = majstori[0];
				var izvestaji = await dnevniIzvestajiDB.find({majstor:req.params.majstorId,date:req.params.date}).toArray();
				var izvestaj = {};
				if(izvestaji.length>0){
					izvestaj = izvestaji[0];
				}

				var yesterday = new Date(req.params.date);
				var monthString = eval(yesterday.getMonth()+1).toString().padStart(2,"0");
				var dateString = eval(yesterday.getDate()).toString().padStart(2,"0");
				var checkIns = await checkInMajstoraDB.find({month:{$in:[monthString,Number(monthString)]},date:{$in:[dateString,Number(dateString)]},year:yesterday.getFullYear()}).toArray();
				for(var i=0;i<majstori.length;i++){
					majstori[i].checkIns = [];
					for(var j=0;j<checkIns.length;j++){
						if(majstori[i].uniqueId == checkIns[j].uniqueId){
							majstori[i].checkIns.push(checkIns[j])
						}
					}
				}
				for(var i=0;i<majstori.length;i++){
					majstori[i].vremeDolaska = "Није се чекирао";
					majstori[i].vremeOdlaska = "Није се чекирао";
					if(majstori[i].checkIns.length>0){
						majstori[i].vremeDolaska = majstori[i].checkIns[0].timestamp;
						majstori[i].vremeOdlaska = majstori[i].checkIns[majstori[i].checkIns.length-1].timestamp;
					}
				}
				for(var i=0;i<majstori.length;i++){
					if(majstori[i].vremeDolaska==majstori[i].vremeOdlaska){
						majstori[i].vremeOdlaska = "Није се чекирао";
					}
				}
				var reversi = await magacinReversiDB.find({datum:getDateAsStringForDisplay(yesterday),majstor:req.params.majstorId}).toArray();
				var proizvodi = await proizvodiDB.find({}).toArray();
				for(var i=0;i<reversi.length;i++){
					for(var j=0;j<reversi[i].zaduzenje.length;j++){
						for(var k=0;k<proizvodi.length;k++){
							if(proizvodi[k].uniqueId==reversi[i].zaduzenje[j].uniqueId){
								reversi[i].zaduzenje[j].price = proizvodi[k].price;
								break;
							}
						}
					}
				}

				var stopovi = await stopoviDB.find({date:getDateAsStringForInputObject(yesterday)}).toArray();

				if(stopovi.length>0){
					var vozila2 = stopovi[0];
				}else{	
					var vozila2 = JSON.parse(JSON.stringify(vozila));
					var startTime = yesterday.toISOString().split('T')[0] + " 00:00:00";
    			var endTime = yesterday.toISOString().split('T')[0] + " 23:59:59";

					config = {
				    url: baseUrl + '/api/DailySummary/GetDailySummary',
				    method: 'POST', // If necessary
				    headers: { 
				        'Content-Type': 'application/json',
				        'Authorization': `Bearer ${token}`
				    },
				    data: { 
				    	'ClientId': process.env.telematicsid, 
				    	'TimeZone':'Central Standard Time',
				    	'StartTime': startTime,
			        'EndTime': endTime
				    }
					};
					console.log("Waiting daily summary")
					var dailySummary = await axios(config);
					for(var i=0;i<dailySummary.data.length;i++){
						for(var j=0;j<vozila2.vozila.Data.length;j++){
							if(vozila2.vozila.Data[j].DeviceName==dailySummary.data[i].RegNo){
								vozila2.vozila.Data[j].dailySummary = dailySummary.data[i];
							}
						}
					}
					
					for(var i=0;i<vozila2.vozila.Data.length;i++){
						var config = {
              url: baseUrl + '/api/Trip/GetMileageSummary',
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
              },
              data: {
                  'ImeiNumber': Number(vozila2.vozila.Data[i].ImeiNumber),
                  'StartTime': startTime,
                  'EndTime': endTime,
                  'TimeZone': 'Central European Standard Time'
              }
            };

            const response = await axios(config);
            vozila2.vozila.Data[i].mileageSummary = response.data;
						await new Promise(resolve => setTimeout(resolve, 2000));
					}
				}
				
				res.render("administracija/dnevniIzvestajMajstora",{
					pageTitle: "Дневни извештај мајстора "+ majstor.ime+" за датум "+reshuffleDate(req.params.date),
					user: req.session.user,
					majstor: majstor,
					vozila: vozila2,
					date: req.params.date,
					izvestaj: izvestaj,
					reversi: reversi
				})
			}catch(error){
				logError(error);
				res.render("message",{
					pageTitle: "Грешка",
					user: req.session.user,
					message: "<div class=\"text\">Грешка у бази података 4582.</div>"
				});
			}
		}else{
			res.render("message",{
				pageTitle: "Грешка",
				user: req.session.user,
				message: "<div class=\"text\">Ваш налог није овлашћен да види ову страницу.</div>"
			});
		}
	}else{
		res.redirect("/login?url="+encodeURIComponent(req.url));
	}
});



server.post('/dnevniIzvestaj',async (req,res)=>{
	if(req.session.user){
		if(Number(req.session.user.role)==10){
			var json = JSON.parse(req.body.json);
			if(json.uniqueId=="new"){
				json.uniqueId = generateId(5)+"--"+new Date().getTime();
				dnevniIzvestajiDB.insertOne(json)
				.then((dbResponse)=>{
					res.render("message",{
						pageTitle: "Извештај унет",
						user: req.session.user,
						message: "<div class=\"text\">Извештај унет.</div>"
					});
				})
				.catch((error)=>{
					logError(error);
					res.render("message",{
						pageTitle: "Програмска грешка",
						user: req.session.user,
						message: "<div class=\"text\">Грешка у бази података 7522.</div>"
					});
				})
			}else{
				dnevniIzvestajiDB.replaceOne({uniqueId:json.uniqueId},json)
				.then((dbResponse)=>{
					res.render("message",{
						pageTitle: "Извештај измењен",
						user: req.session.user,
						message: "<div class=\"text\">Извештај измењен.</div>"
					});
				})
				.catch((error)=>{
					logError(error);
					res.render("message",{
						pageTitle: "Програмска грешка",
						user: req.session.user,
						message: "<div class=\"text\">Грешка у бази података 7522.</div>"
					});
				})
			}
		}else{
			res.render("message",{
				pageTitle: "Грешка",
				user: req.session.user,
				message: "<div class=\"text\">Ваш налог није овлашћен да види ову страницу.</div>"
			});
		}
	}else{
		res.redirect("/login?url="+encodeURIComponent(req.url));
	}
});

server.get('/ucinakMajstora',async (req,res)=>{
	if(req.session.user){
		if(Number(req.session.user.role)==5 || Number(req.session.user.role)==10 || Number(req.session.user.role)==20){
			ucinakMajstoraDB.find({}).toArray()
			.then((ucinci)=>{
				stariUcinakMajstoraDB.find({}).toArray()
				.then((stariUcinci)=>{
					majstoriDB.find({}).toArray()
					.then((majstori)=>{
						var majstoriObject = [];
						for(var i=0;i<majstori.length;i++){
							if(podizvodjaci.indexOf(majstori[i].uniqueId)<0 && !majstori[i].inactive){
								var majstorObject = {};
								majstorObject.name 			= majstori[i].ime;
								majstorObject.uniqueId	= majstori[i].uniqueId;
								majstorObject.ukupanUcinak = 0;
								majstorObject.ukupnoNaloga = 0;
								majstorObject.mesecno = [];
								var meseci = ["2023-12","2024-01","2024-02","2024-03","2024-04"];
								for(var j=0;j<meseci.length;j++){
									var mesecniUcinak = {};
									mesecniUcinak.mesec = meseci[j];
									mesecniUcinak.ukupnoNaloga = 0;
									mesecniUcinak.ukupanIznos = 0;
									for(var k=0;k<stariUcinci.length;k++){
										if(stariUcinci[k].datum.includes(mesecniUcinak.mesec) && stariUcinci[k].majstor == majstorObject.uniqueId){
											mesecniUcinak.ukupnoNaloga++;
											majstorObject.ukupnoNaloga++;
											majstorObject.ukupanUcinak = majstorObject.ukupanUcinak + parseFloat(stariUcinci[k].ukupanIznos);
											mesecniUcinak.ukupanIznos = mesecniUcinak.ukupanIznos + parseFloat(stariUcinci[k].ukupanIznos);
										}
									}
									for(var k=0;k<ucinci.length;k++){
										if(ucinci[k].datum.includes(mesecniUcinak.mesec) && stariUcinci[k].majstor == majstorObject.uniqueId){
											mesecniUcinak.ukupnoNaloga++;
											majstorObject.ukupnoNaloga++;
											majstorObject.ukupanUcinak = majstorObject.ukupanUcinak + parseFloat(ucinci[k].ukupanIznos);
											mesecniUcinak.ukupanIznos = mesecniUcinak.ukupanIznos + parseFloat(ucinci[k].ukupanIznos);
										}
									}
									majstorObject.mesecno.push(mesecniUcinak)
								}
								majstoriObject.push(majstorObject);	
							}
						}
						res.render("ucinakMajstora",{
							pageTitle:"Учинак мајстора",
							ucinak: majstoriObject,
							user: req.session.user
						});
					})
					.catch((error)=>{
						logError(error);
						res.render("message",{
							pageTitle: "Програмска грешка",
							user: req.session.user,
							message: "<div class=\"text\">Дошло је до грешке у бази податка 1880.</div>"
						});
					})
				})
				.catch((error)=>{
					logError(error);
					res.render("message",{
						pageTitle: "Програмска грешка",
						user: req.session.user,
						message: "<div class=\"text\">Дошло је до грешке у бази податка 1880.</div>"
					});
				})
			})
			.catch((error)=>{
				logError(error);
				res.render("message",{
					pageTitle: "Програмска грешка",
					user: req.session.user,
					message: "<div class=\"text\">Дошло је до грешке у бази податка 1880.</div>"
				});
			})
		}else{
			res.render("message",{
				pageTitle: "Грешка",
				user: req.session.user,
				message: "<div class=\"text\">Ваш налог није овлашћен да види ову страницу.</div>"
			});
		}
	}else{
		res.redirect("/login?url="+encodeURIComponent(req.url));
	}
});


server.get('/ucinakMajstora',async (req,res)=>{
	if(req.session.user){
		if(Number(req.session.user.role)==10 || Number(req.session.user.role)==20){
			ucinakMajstoraDB.find({}).toArray()
			.then((ucinci)=>{
				stariUcinakMajstoraDB.find({}).toArray()
				.then((stariUcinci)=>{
					majstoriDB.find({}).toArray()
					.then((majstori)=>{
						var majstoriObject = [];
						for(var i=0;i<majstori.length;i++){
							var majstorObject = {};
							majstorObject.name 			= majstori[i].ime;
							majstorObject.uniqueId	= majstori[i].uniqueId;
							majstorObject.ukupanUcinak = 0;
							majstorObject.ukupnoNaloga = 0;
							majstorObject.mesecno = [];
							var meseci = ["2023-12,2024-1,2024-2,2024-3"]
							for(var i=0;i<meseci.length;i++){
								var mesecniUcinak = {};
								mesecniUcinak.mesec = meseci[i];
								mesecniUcinak.ukupnoNaloga = 0;
								mesecniUcinak.ukupanIznos = 0;
								for(var j=0;j<stariUcinci.length;j++){
									if(stariUcinci[j].datum.includes(meseci[i])){
										mesecniUcinak.ukupnoNaloga++;
										mesecniUcinak.ukupanIznos = mesecniUcinak.ukupanIznos + parseFloat(stariUcinci[j].ukupanIznos);
									}
								}
								for(var j=0;j<ucinci.length;j++){
									if(ucinci[j].datum.includes(meseci[i])){
										mesecniUcinak.ukupnoNaloga++;
										mesecniUcinak.ukupanIznos = mesecniUcinak.ukupanIznos + parseFloat(stariUcinci[j].ukupanIznos);
									}
								}
							}
							res.render("ucinakMajstora",{
								pageTitle:"Учинак мајстора",
								ucinak: majstoriObject,
								user: req.session.user
							});
						}
					})
					.catch((error)=>{
						logError(error);
						res.render("message",{
							pageTitle: "Програмска грешка",
							user: req.session.user,
							message: "<div class=\"text\">Дошло је до грешке у бази податка 1880.</div>"
						});
					})
				})
				.catch((error)=>{
					logError(error);
					res.render("message",{
						pageTitle: "Програмска грешка",
						user: req.session.user,
						message: "<div class=\"text\">Дошло је до грешке у бази податка 1880.</div>"
					});
				})

			})
			.catch((error)=>{
				logError(error);
				res.render("message",{
					pageTitle: "Програмска грешка",
					user: req.session.user,
					message: "<div class=\"text\">Дошло је до грешке у бази податка 1878.</div>"
				});
			})
		}else{
			res.render("message",{
				pageTitle: "Грешка",
				user: req.session.user,
				message: "<div class=\"text\">Ваш налог није овлашћен да види ову страницу.</div>"
			});
		}
	}else{
		res.redirect("/login?url="+encodeURIComponent(req.url))
	}
});

server.get('/mapa',async (req,res)=>{
	if(req.session.user){
		if(Number(req.session.user.role)==5 || Number(req.session.user.role)==10 || Number(req.session.user.role)==20 || Number(req.session.user.role)==25){
			if(Number(req.session.user.role)==20){
				naloziDB.find({radnaJedinica:{$in:req.session.user.opstine},statusNaloga:{$nin:["Završeno","Nalog u Stambenom","Storniran","Vraćen","Spreman za fakturisanje","Fakturisan","Spreman za obračun"]}}).toArray()
				.then((nalozi) => {
					var naloziZaMapu = [];
					for(var i=0;i<nalozi.length;i++){
						var nalogZaMapu = {};
						nalogZaMapu.broj = nalozi[i].broj;
						nalogZaMapu.statusNaloga = nalozi[i].statusNaloga;
						nalogZaMapu.coordinates = nalozi[i].coordinates;
						naloziZaMapu.push(nalogZaMapu);
					}
					res.render("mapa",{
						pageTitle: "Мапа",
						nalozi: naloziZaMapu,
						user: req.session.user
					});
				})
				.catch((error)=>{
					logError(error);
					res.render("message",{
						pageTitle: "Грешка",
						user: req.session.user,
						message: "<div class=\"text\">Дошло је до грешке у бази података 4037.</div>"
					});
				})
			}else{
				res.render("mapa",{
					pageTitle: "Мапа",
					user: req.session.user,
				});	
			}
		}else{
			res.render("message",{
				pageTitle: "Грешка",
				user: req.session.user,
				message: "<div class=\"text\">Ваш налог није овлашћен да види ову страницу.</div>"
			});
		}
	}else{
		res.redirect("/login?url="+encodeURIComponent(req.url))
	}
});

server.get('/wome',async (req,res)=>{
	if(req.session.user){
		if(Number(req.session.user.role)==10 || Number(req.session.user.role)==20){
			naloziDB.find({statusNaloga:"Potrebna WOMA"}).toArray()
			.then((nalozi) => {
				var naloziZaMapu = [];
				for(var i=0;i<nalozi.length;i++){
					var nalogZaMapu = {};
					nalogZaMapu.broj = nalozi[i].broj;
					nalogZaMapu.statusNaloga = nalozi[i].statusNaloga;
					nalogZaMapu.coordinates = nalozi[i].coordinates;
					naloziZaMapu.push(nalogZaMapu);
				}
				res.render("administracija/wome",{
					pageTitle: "WOME",
					nalozi: naloziZaMapu,
					googlegeocoding: process.env.googlegeocoding,
					user: req.session.user
				});
			})
			.catch((error)=>{
				logError(error);
				res.render("message",{
					pageTitle: "Грешка",
					user: req.session.user,
					message: "<div class=\"text\">Дошло је до грешке у бази података 4453.</div>"
				});
			})
		}else{
			res.render("message",{
				pageTitle: "Грешка",
				user: req.session.user,
				message: "<div class=\"text\">Ваш налог није овлашћен да види ову страницу.</div>"
			});
		}
	}else{
		res.redirect("/login?url="+encodeURIComponent(req.url))
	}
});

server.get('/mapaUzivo',async (req,res)=>{
	naloziDB.find({majstor:{$nin:podizvodjaci},statusNaloga:{$nin:["Završeno","Storniran","Vraćen","Fakturisan","Spreman za fakturisanje","Nalog u Stambenom"]}}).toArray()
	.then((nalozi)=>{
		var brojeviNaloga = [];
		for(var i=0;i<nalozi.length;i++){
			brojeviNaloga.push(nalozi[i].broj)
		}
		dodeljivaniNaloziDB.find({nalog:{$in:brojeviNaloga}}).toArray()
		.then((dodele)=>{
			for(var i=0;i<nalozi.length;i++){
				nalozi[i].dodele = [];
				for(var j=0;j<dodele.length;j++){
					if(dodele[j].nalog==nalozi[i].broj){
						nalozi[i].dodele.push(dodele[j]);
					}
				}
			}
			majstoriDB.find({uniqueId:{$nin:podizvodjaci}}).toArray()
			.then((majstori)=>{
				ekipeDB.find({}).sort({ _id: -1 }).limit(1).toArray()
				.then((ekipe)=>{
					for(var i=0;i<majstori.length;i++){
						for(var j=0;j<ekipe[0].prisustvo.ekipe.length;j++){
							if(majstori[i].uniqueId==ekipe[0].prisustvo.ekipe[j].idMajstora){
								majstori[i].vozilo = ekipe[0].prisustvo.ekipe[j].vozilo;
							}
						}
					}

					var config = {
						method: 'post',
						url: baseUrl+'/token', // Replace with your actual URL
						headers: {
							'Content-Type': 'application/x-www-form-urlencoded'
						},
						data: data
					};
					axios(config)
					.then(async response => {
					  token = response.data.access_token;
					  var json = {};

						config = {
					      url: baseUrl + '/api/Client/GetClient',
					      method: 'POST', // If necessary
					      headers: { 
					          'Content-Type': 'application/json',
					          'Authorization': `Bearer ${token}`
					      },
					      data: { 'ClientId': telematicsId }
					  };

					  //Client data
					  var response = await axios(config);
					  //console.log(response.data)
					  json.clientInfo = response.data.client[0];

					  
					  config = {
					      url: baseUrl + '/api/Asset/GetDevicesCurrentData',
					      method: 'POST', // If necessary
					      headers: { 
					          'Content-Type': 'application/json',
					          'Authorization': `Bearer ${token}`
					      },
					      data: { 'ClientId': telematicsId }
					  };
					  var response = await axios(config);
					  json.vozila = response.data;
					  res.render("mapaUzivo",{
							pageTitle: "Мапа радова",
							nalozi: nalozi,
							majstori: majstori,
							navigacija: json,
							googlegeocoding: process.env.googlegeocoding
						})
					})
					.catch((error)=>{
						console.log(error)
						res.send("Greska")
					})


					
				})
				.catch((error)=>{
					console.log(error);
					res.render("message",{
						pageTitle: "Грешка",
						user: req.session.user,
						message: "<div class=\"text\">Грешка у налогу.</div>"
					});
				})
			})
			.catch((error)=>{
				console.log(error);
				res.render("message",{
					pageTitle: "Грешка",
					user: req.session.user,
					message: "<div class=\"text\">Грешка у налогу.</div>"
				});
			})
		})
		.catch((error)=>{
			console.log(error);
			res.render("message",{
				pageTitle: "Грешка",
				user: req.session.user,
				message: "<div class=\"text\">Грешка у налогу.</div>"
			});
		})
	})
	.catch((error)=>{
		console.log(error)
		res.render("message",{
			pageTitle: "Грешка",
			user: req.session.user,
			message: "<div class=\"text\">Грешка у налогу.</div>"
		});
	})
});

server.get('/listaWoma',async (req,res)=>{
	if(req.session.user){
			if(Number(req.session.user.role)==10 || Number(req.session.user.role)==20){
				naloziDB.find({statusNaloga:"Potrebna WOMA"}).toArray()
				.then((nalozi) => {
					for(var i=0;i<nalozi.length;i++){
						delete nalozi[i]._id;
						delete nalozi[i].uniqueId;
						delete nalozi[i].digitalizacija;
						delete nalozi[i].opis;
						delete nalozi[i].vrstaRada;
						delete nalozi[i].kategorijeRadova;
						delete nalozi[i].punaAdresa;
						delete nalozi[i].obracun;
						delete nalozi[i].ukupanIznos;
						delete nalozi[i].faktura;
						delete nalozi[i].prijemnica;
					}
					res.render("administracija/listaWoma",{
						pageTitle:"Листа WOMA",
						user: req.session.user,
						nalozi: nalozi
					})
				})
				.catch((error)=>{
					logError(error);
					res.render("message",{
						pageTitle: "Програмска грешка",
						user: req.session.user,
						message: "<div class=\"text\">Дошло је до грешке у бази податка 4599.</div>"
					});
				});
			
		}else{
			res.render("message",{
				pageTitle: "Грешка",
				user: req.session.user,
				message: "<div class=\"text\">Ваш налог није овлашћен да види ову страницу.</div>"
			});
		}
	}else{
		res.redirect("/login?url="+encodeURIComponent(req.url))
	}
});

server.get('/dispecer/rasporedRadova', async(req,res)=>{
	if(req.session.user){
		if(Number(req.session.user.role)==20){
			var monday = getMonday(new Date());
			var dates = [];
			for(var i=0;i<7;i++){
				dates.push(monday.getFullYear()+"-"+eval(monday.getMonth()+1).toString().padStart(2,"0")+"-"+monday.getDate().toString().padStart(2,"0"));
				monday.setDate(monday.getDate()+1);
			}
			majstoriDB.find({}).toArray()
			.then((majstori)=>{
				dodeljivaniNaloziDB.find({datumRadova:{$in:dates}}).toArray()
				.then((dodele)=>{
					res.render("dispeceri/rasporedRadova",{
						user: req.session.user,
						pageTitle: "Недељни распоред радова",
						dodele: dodele,
						majstori: majstori,
						dates: dates
					});
				})
				.catch((error)=>{
					logError(error);
					res.send("Greska u bazi podataka");
				})
			})
			.catch((error)=>{
				logError(error);
				res.send("Greska");
			})
		}else{
			res.render("message",{
				pageTitle: "Грешка",
				user: req.session.user,
				message: "<div class=\"text\">Ваш налог није овлашћен да види ову страницу.</div>"
			});
		}
	}else{
		res.redirect("/login?url="+encodeURIComponent(req.url))
	}
})

server.get('/dispecer/sviNalozi',async (req,res)=>{
	if(req.session.user){
		if(Number(req.session.user.role)==20){
			try{
				var nalozi = await naloziDB.find({radnaJedinica:{$in:req.session.user.opstine},statusNaloga:{$nin:["Nalog u Stambenom","Storniran","Spreman za fakturisanje","Fakturisan","Spreman za obračun"]}}).toArray()
				var nalozi2024 = await nalozi2024DB.find({radnaJedinica:{$in:req.session.user.opstine},statusNaloga:{$nin:["Nalog u Stambenom","Storniran","Spreman za fakturisanje","Fakturisan","Spreman za obračun"]}}).toArray()
				for(var i=0;i<nalozi2024.length;i++){
					nalozi.push(nalozi2024[i])
				}
				for(var i=0;i<nalozi.length;i++){
					delete nalozi[i]._id;
					delete nalozi[i].uniqueId;
					delete nalozi[i].digitalizacija;
					delete nalozi[i].opis;
					delete nalozi[i].vrstaRada;
					delete nalozi[i].kategorijeRadova;
					delete nalozi[i].punaAdresa;
					delete nalozi[i].obracun;
					delete nalozi[i].ukupanIznos;
					delete nalozi[i].faktura;
					delete nalozi[i].prijemnica;
				}
				res.render("dispeceri/sviNalozi",{
					pageTitle:"Сви налози",
					user: req.session.user,
					nalozi: nalozi
				})

			}catch(err){
				logError(err);
				res.render("message",{
					pageTitle: "Програмска грешка",
					user: req.session.user,
					message: "<div class=\"text\">Дошло је до грешке у бази податка 2487.</div>"
				});
			}
		}else{
			res.render("message",{
				pageTitle: "Грешка",
				user: req.session.user,
				message: "<div class=\"text\">Ваш налог није овлашћен да види ову страницу.</div>"
			});
		}
	}else{
		res.redirect("/login?url="+encodeURIComponent(req.url))
	}
});

server.get('/dispecer/otvoreniNalozi',async (req,res)=>{
	if(req.session.user){
			if(Number(req.session.user.role)==20 || Number(req.session.user.role)==10){
				var skriveniStatusi = ["Završeno","Nalog u Stambenom","Storniran","Spreman za fakturisanje","Fakturisan","Spreman za obračun"];
				if(Number(req.session.user.role)==10){
					skriveniStatusi = ["Nalog u Stambenom","Storniran","Spreman za fakturisanje","Fakturisan","Spreman za obračun"];
				}
				try{
					var nalozi = await naloziDB.find({radnaJedinica:{$in:req.session.user.opstine},statusNaloga:{$nin:skriveniStatusi}}).toArray();
					var nalozi2024 = await nalozi2024DB.find({radnaJedinica:{$in:req.session.user.opstine},statusNaloga:{$nin:skriveniStatusi}}).toArray();
					for(var i=0;i<nalozi2024.length;i++){
						nalozi.push(nalozi2024[i])
					}
					var brojeviNaloga = [];
					for(var i=0;i<nalozi.length;i++){
						delete nalozi[i]._id;
						delete nalozi[i].uniqueId;
						delete nalozi[i].digitalizacija;
						delete nalozi[i].opis;
						delete nalozi[i].vrstaRada;
						delete nalozi[i].kategorijeRadova;
						delete nalozi[i].punaAdresa;
						delete nalozi[i].obracun;
						delete nalozi[i].ukupanIznos;
						delete nalozi[i].faktura;
						delete nalozi[i].prijemnica;
						brojeviNaloga.push(nalozi[i].broj)
					}
					var dodele = dodeljivaniNaloziDB.find({nalog:{$in:brojeviNaloga}}).toArray();
					for(var i=0;i<nalozi.length;i++){
						nalozi[i].dodele = [];
						for(var j=0;j<dodele.length;j++){
							if(dodele[j].nalog==nalozi[i].broj){
								nalozi[i].dodele.push(dodele[j])
							}
						}
					}

					for(var i=0;i<nalozi.length;i++){
						nalozi[i].kasni = true;
						var today = new Date();
						today.setHours(0,0,0,0);
						for(var j=0;j<nalozi[i].dodele.length;j++){
							if(new Date(nalozi[i].dodele[j].datumRadova).getTime()>=today.getTime()){
								nalozi[i].kasni = false;
							}
						}
					}
					var majstori = await majstoriDB.find({}).toArray();
					res.render("dispeceri/otvoreniNalozi",{
						pageTitle:"Отворени налози",
						user: req.session.user,
						majstori: majstori,
						nalozi: nalozi
					});
				}catch(err){
					logError(err);
					res.render("message",{
						pageTitle: "Програмска грешка",
						user: req.session.user,
						message: "<div class=\"text\">Дошло је до грешке у бази податка 281.</div>"
					});
				}
		}else{
			res.render("message",{
				pageTitle: "Грешка",
				user: req.session.user,
				message: "<div class=\"text\">Ваш налог није овлашћен да види ову страницу.</div>"
			});
		}
	}else{
		res.redirect("/login?url="+encodeURIComponent(req.url))
	}
});

server.get('/dispecer/storniraniNalozi',async (req,res)=>{
	if(req.session.user){
			if(Number(req.session.user.role)==20 || Number(req.session.user.role)==10){
				try{
					var nalozi = await naloziDB.find({radnaJedinica:{$in:req.session.user.opstine},statusNaloga:"Storniran"}).toArray();
					var nalozi2024 = await nalozi2024DB.find({radnaJedinica:{$in:req.session.user.opstine},statusNaloga:"Storniran"}).toArray();
					for(var i=0;i<nalozi2024.length;i++){
						nalozi.push(nalozi2024[i])
					}
					var brojeviNaloga = [];
					for(var i=0;i<nalozi.length;i++){
						delete nalozi[i]._id;
						delete nalozi[i].uniqueId;
						delete nalozi[i].digitalizacija;
						delete nalozi[i].opis;
						delete nalozi[i].vrstaRada;
						delete nalozi[i].kategorijeRadova;
						delete nalozi[i].punaAdresa;
						delete nalozi[i].obracun;
						delete nalozi[i].ukupanIznos;
						delete nalozi[i].faktura;
						delete nalozi[i].prijemnica;
						brojeviNaloga.push(nalozi[i].broj)
					}
					var dodele = dodeljivaniNaloziDB.find({nalog:{$in:brojeviNaloga}}).toArray();
					for(var i=0;i<nalozi.length;i++){
						nalozi[i].dodele = [];
						for(var j=0;j<dodele.length;j++){
							if(dodele[j].nalog==nalozi[i].broj){
								nalozi[i].dodele.push(dodele[j])
							}
						}
					}

					for(var i=0;i<nalozi.length;i++){
						nalozi[i].kasni = true;
						var today = new Date();
						today.setHours(0,0,0,0);
						for(var j=0;j<nalozi[i].dodele.length;j++){
							if(new Date(nalozi[i].dodele[j].datumRadova).getTime()>=today.getTime()){
								nalozi[i].kasni = false;
							}
						}
					}
					var majstori = await majstoriDB.find({}).toArray();
					res.render("dispeceri/otvoreniNalozi",{
						pageTitle:"Отворени налози",
						user: req.session.user,
						majstori: majstori,
						nalozi: nalozi
					});
				}catch(err){
					logError(err);
					res.render("message",{
						pageTitle: "Програмска грешка",
						user: req.session.user,
						message: "<div class=\"text\">Дошло је до грешке у бази податка 281.</div>"
					});
				}
		}else{
			res.render("message",{
				pageTitle: "Грешка",
				user: req.session.user,
				message: "<div class=\"text\">Ваш налог није овлашћен да види ову страницу.</div>"
			});
		}
	}else{
		res.redirect("/login?url="+encodeURIComponent(req.url))
	}
});

server.get('/dispecer/dodeljeniNalozi',async (req,res)=>{
	if(req.session.user){
			if(Number(req.session.user.role)==20){
				var today = new Date();
				today.setDate(today.getDate());
				dodeljivaniNaloziDB.find({radnaJedinica:{$in:req.session.user.opstine},"datum.datum":getDateAsStringForDisplay(today)}).toArray()
				.then((dodeljeniNalozi)=>{
					var brojeviNaloga = [];
					for(var i=0;i<dodeljeniNalozi.length;i++){
						brojeviNaloga.push(dodeljeniNalozi[i].nalog);
					}
					naloziDB.find({broj:{$in:brojeviNaloga}}).toArray()
					.then((nalozi) => {
						for(var i=0;i<nalozi.length;i++){
							delete nalozi[i]._id;
							delete nalozi[i].uniqueId;
							delete nalozi[i].digitalizacija;
							delete nalozi[i].opis;
							delete nalozi[i].vrstaRada;
							delete nalozi[i].kategorijeRadova;
							delete nalozi[i].punaAdresa;
							delete nalozi[i].obracun;
							delete nalozi[i].ukupanIznos;
							delete nalozi[i].faktura;
							delete nalozi[i].prijemnica;
						}
						res.render("dispeceri/dodeljeniNalozi",{
							pageTitle:"Додељени налози",
							user: req.session.user,
							nalozi: nalozi
						})
					})
					.catch((error)=>{
						logError(error);
						res.render("message",{
							pageTitle: "Програмска грешка",
							user: req.session.user,
							message: "<div class=\"text\">Дошло је до грешке у бази податка 281.</div>"
						});
					});
				})
				.catch((error)=>{
					logError(error);
					res.render("message",{
						pageTitle: "Програмска грешка",
						user: req.session.user,
						message: "<div class=\"text\">Дошло је до грешке у бази податка 6081.</div>"
					});
				})

				
			
		}else{
			res.render("message",{
				pageTitle: "Грешка",
				user: req.session.user,
				message: "<div class=\"text\">Ваш налог није овлашћен да види ову страницу.</div>"
			});
		}
	}else{
		res.redirect("/login?url="+encodeURIComponent(req.url))
	}
});


server.get('/dispecer/zavrseniNalozi',async (req,res)=>{
	if(req.session.user){
		if(Number(req.session.user.role)==20){
			try{
				var nalozi = await naloziDB.find({radnaJedinica:{$in:req.session.user.opstine},statusNaloga:{$in:["Završeno","Spreman za obračun"]}}).toArray();
				var nalozi2024 = await nalozi2024DB.find({radnaJedinica:{$in:req.session.user.opstine},statusNaloga:{$in:["Završeno","Spreman za obračun"]}}).toArray();
				for(var i=0;i<nalozi2024.length;i++){
					nalozi.push(nalozi2024[i])
				}
				for(var i=0;i<nalozi.length;i++){
					delete nalozi[i]._id;
					delete nalozi[i].uniqueId;
					delete nalozi[i].digitalizacija;
					delete nalozi[i].opis;
					delete nalozi[i].vrstaRada;
					delete nalozi[i].kategorijeRadova;
					delete nalozi[i].punaAdresa;
					delete nalozi[i].obracun;
					delete nalozi[i].ukupanIznos;
					delete nalozi[i].faktura;
					delete nalozi[i].prijemnica;
				}
				res.render("dispeceri/zavrseniNalozi",{
					pageTitle:"Завршени налози",
					user: req.session.user,
					nalozi: nalozi
				})

			}catch(err){
				logError(err);
				res.render("message",{
					pageTitle: "Програмска грешка",
					user: req.session.user,
					message: "<div class=\"text\">Дошло је до грешке у бази податка 281.</div>"
				});
			}
		}else{
			res.render("message",{
				pageTitle: "Грешка",
				user: req.session.user,
				message: "<div class=\"text\">Ваш налог није овлашћен да види ову страницу.</div>"
			});
		}
	}else{
		res.redirect("/login?url="+encodeURIComponent(req.url))
	}
});

server.get('/dispecer/pretragaNaloga',async (req,res)=>{
	if(req.session.user){
		res.render("dispeceri/pretragaNaloga",{
			pageTitle:"Претрага налога",
			user: req.session.user
		});
	}else{
		res.redirect("/login?url="+encodeURIComponent(req.url));
	}
});

server.get('/dispecer/mapaUzivo', async (req, res)=> {
	if(req.session.user){
		if(Number(req.session.user.role)==20){
			naloziDB.find({radnaJedinica:{$in:req.session.user.opstine},statusNaloga:{$nin:["Završeno","Storniran","Vraćen","Fakturisan","Spreman za fakturisanje","Nalog u Stambenom"]}}).toArray()
			.then((nalozi)=>{
				var brojeviNaloga = [];
				for(var i=0;i<nalozi.length;i++){
					brojeviNaloga.push(nalozi[i].broj)
				}
				dodeljivaniNaloziDB.find({nalog:{$in:brojeviNaloga}}).toArray()
				.then((dodele)=>{
					for(var i=0;i<nalozi.length;i++){
						nalozi[i].dodele = [];
						for(var j=0;j<dodele.length;j++){
							if(dodele[j].nalog==nalozi[i].broj){
								nalozi[i].dodele.push(dodele[j]);
							}
						}
					}
					majstoriDB.find({uniqueId:{$nin:podizvodjaci}}).toArray()
					.then((majstori)=>{
						ekipeDB.find({}).sort({ _id: -1 }).limit(1).toArray()
						.then((ekipe)=>{
							for(var i=0;i<majstori.length;i++){
								for(var j=0;j<ekipe[0].prisustvo.ekipe.length;j++){
									if(majstori[i].uniqueId==ekipe[0].prisustvo.ekipe[j].idMajstora){
										majstori[i].vozilo = ekipe[0].prisustvo.ekipe[j].vozilo;
									}
								}
							}


							var config = {
								method: 'post',
								url: baseUrl+'/token', // Replace with your actual URL
								headers: {
									'Content-Type': 'application/x-www-form-urlencoded'
								},
								data: data
							};
							axios(config)
							.then(async response => {
							  token = response.data.access_token;
							  var json = {};

								config = {
							      url: baseUrl + '/api/Client/GetClient',
							      method: 'POST', // If necessary
							      headers: { 
							          'Content-Type': 'application/json',
							          'Authorization': `Bearer ${token}`
							      },
							      data: { 'ClientId': telematicsId }
							  };

							  //Client data
							  var response = await axios(config);
							  //console.log(response.data)
							  json.clientInfo = response.data.client[0];

							  
							  config = {
							      url: baseUrl + '/api/Asset/GetDevicesCurrentData',
							      method: 'POST', // If necessary
							      headers: { 
							          'Content-Type': 'application/json',
							          'Authorization': `Bearer ${token}`
							      },
							      data: { 'ClientId': telematicsId }
							  };
							  var response = await axios(config);
							  json.vozila = response.data;

								res.render("dispeceri/mapaUzivoDispecer",{
									pageTitle: "Мапа радова",
									nalozi: nalozi,
									user: req.session.user,
									majstori: majstori,
									navigacija: json,
									googlegeocoding: process.env.googlegeocoding
								})
							})
							.catch((error)=>{
								console.log(error)
								res.send("Greska")
							})




							
						})
						.catch((error)=>{
							console.log(error);
							res.render("message",{
								pageTitle: "Грешка",
								user: req.session.user,
								message: "<div class=\"text\">Грешка у налогу.</div>"
							});
						})
					})
					.catch((error)=>{
						console.log(error);
						res.render("message",{
							pageTitle: "Грешка",
							user: req.session.user,
							message: "<div class=\"text\">Грешка у налогу.</div>"
						});
					})
				})
				.catch((error)=>{
					console.log(error);
					res.render("message",{
						pageTitle: "Грешка",
						user: req.session.user,
						message: "<div class=\"text\">Грешка у налогу.</div>"
					});
				})
			})
			.catch((error)=>{
				console.log(error)
				res.render("message",{
					pageTitle: "Грешка",
					user: req.session.user,
					message: "<div class=\"text\">Грешка у налогу.</div>"
				});
			})
		}else{
			res.render("message",{
				pageTitle: "Грешка",
				user: req.session.user,
				message: "<div class=\"text\">Ваш налог није овлашћен да види ову страницу.</div>"
			});
		}
	}else{
		res.redirect("/login?url="+encodeURIComponent(req.url));
	}
})

server.get('/podizvodjac/pretragaNaloga',async (req,res)=>{
	if(req.session.user){
		res.render("dispeceri/pretragaNaloga",{ // KORISTIM ISTO DA NE IDEM COPY PASTE JER JE ISTI INTERFEJS
			pageTitle:"Претрага налога",
			user: req.session.user
		});
	}else{
		res.redirect("/login?url="+encodeURIComponent(req.url));
	}
});

server.post('/pretragaNalogaPoAdresi', async (req, res)=> {
	if(req.session.user){
		if(Number(req.session.user.role)==10 || Number(req.session.user.role)==20){
			try{
				var nalozi = await naloziDB.find({adresa:{ $regex: req.body.adresa, $options: 'i' }}).toArray();
				var nalozi2024 = await nalozi2024DB.find({adresa:{ $regex: req.body.adresa, $options: 'i' }}).toArray();
				for(var i=0;i<nalozi2024.length;i++){
					nalozi.push(nalozi2024[i])
				}
				for(var i=0;i<nalozi.length;i++){
					delete nalozi[i]._id;
					delete nalozi[i].uniqueId;
					delete nalozi[i].digitalizacija;
					delete nalozi[i].opis;
					delete nalozi[i].vrstaRada;
					delete nalozi[i].kategorijeRadova;
					delete nalozi[i].punaAdresa;
					delete nalozi[i].obracun;
					delete nalozi[i].ukupanIznos;
					delete nalozi[i].faktura;
					delete nalozi[i].prijemnica;
				}
				res.render("dispeceri/pretragaNalogaRezultati",{
					pageTitle:"Резултати претраге за \""+req.body.adresa+"\"",
					user: req.session.user,
					nalozi: nalozi
				})
			}catch(err){
				logError(err);
				res.render("message",{
					pageTitle: "Програмска грешка",
					user: req.session.user,
					message: "<div class=\"text\">Дошло је до грешке у бази податка 940.</div>"
				});
			}
		}else if(Number(req.session.user.role)==30){
			try{
				var nalozi = await naloziDB.find({majstor:req.session.user.nalozi,adresa:{ $regex: req.body.adresa, $options: 'i' }}).toArray();
				var nalozi2024 = await nalozi2024DB.find({majstor:req.session.user.nalozi,adresa:{ $regex: req.body.adresa, $options: 'i' }}).toArray();
				for(var i=0;i<nalozi2024.length;i++){
					nalozi.push(nalozi2024[i])
				}
				for(var i=0;i<nalozi.length;i++){
					delete nalozi[i]._id;
					delete nalozi[i].uniqueId;
					delete nalozi[i].digitalizacija;
					delete nalozi[i].opis;
					delete nalozi[i].vrstaRada;
					delete nalozi[i].kategorijeRadova;
					delete nalozi[i].punaAdresa;
					delete nalozi[i].obracun;
					delete nalozi[i].ukupanIznos;
					delete nalozi[i].faktura;
					delete nalozi[i].prijemnica;
				}
				res.render("podizvodjaci/pretragaNalogaRezultati",{
					pageTitle:"Резултати претраге за \""+req.body.adresa+"\"",
					user: req.session.user,
					nalozi: nalozi
				})
			}catch(err){
				logError(err);
				res.render("message",{
					pageTitle: "Програмска грешка",
					user: req.session.user,
					message: "<div class=\"text\">Дошло је до грешке у бази податка 940.</div>"
				});
			}
			
		}else{
			res.render("message",{
				pageTitle: "Грешка",
				user: req.session.user,
				message: "<div class=\"text\">Ваш налог није овлашћен да види ову страницу.</div>"
			});
		}
	}else{
		res.redirect("/login");	
	}
});

server.get('/dispecer/mojUcinak',async (req,res)=>{
	if(req.session.user){
			if(Number(req.session.user.role)==20){
				res.render("dispeceri/mojUcinak",{
					pageTitle:"Мој учинак",
					user: req.session.user
				})
			
		}else{
			res.render("message",{
				pageTitle: "Грешка",
				user: req.session.user,
				message: "<div class=\"text\">Ваш налог није овлашћен да види ову страницу.</div>"
			});
		}
	}else{
		res.redirect("/login?url="+encodeURIComponent(req.url))
	}
});

server.get('/podizvodjac/otvoreniNalozi',async (req,res)=>{
	if(req.session.user){
		if(Number(req.session.user.role)==30){
			try{
				var nalozi = await naloziDB.find({majstor:req.session.user.nalozi,statusNaloga:{$nin:["Završeno","Nalog u Stambenom","Storniran","Vraćen","Spreman za fakturisanje","Fakturisan","Spreman za obračun"]}}).toArray();
				var nalozi2024 = await nalozi2024DB.find({majstor:req.session.user.nalozi,statusNaloga:{$nin:["Završeno","Nalog u Stambenom","Storniran","Vraćen","Spreman za fakturisanje","Fakturisan","Spreman za obračun"]}}).toArray()
				for(var i=0;i<nalozi2024.length;i++){
					nalozi.push(nalozi2024[i])
				}
				for(var i=0;i<nalozi.length;i++){
					delete nalozi[i]._id;
					delete nalozi[i].uniqueId;
					delete nalozi[i].digitalizacija;
					delete nalozi[i].opis;
					delete nalozi[i].vrstaRada;
					delete nalozi[i].kategorijeRadova;
					delete nalozi[i].punaAdresa;
					delete nalozi[i].obracun;
					delete nalozi[i].ukupanIznos;
					delete nalozi[i].faktura;
					delete nalozi[i].prijemnica;
				}
				res.render("podizvodjaci/otvoreniNalozi",{
					pageTitle:"Отворени налози",
					user: req.session.user,
					nalozi: nalozi
				})
			}catch(err){
				logError(err);
				res.render("message",{
					pageTitle: "Програмска грешка",
					user: req.session.user,
					message: "<div class=\"text\">Дошло је до грешке у бази податка 1243.</div>"
				});
			}
		}else{
			res.render("message",{
				pageTitle: "Грешка",
				user: req.session.user,
				message: "<div class=\"text\">Ваш налог није овлашћен да види ову страницу.</div>"
			});
		}
	}else{
		res.redirect("/login?url="+encodeURIComponent(req.url));
	}
});

server.get('/podizvodjac/storniraniNalozi',async (req,res)=>{
	if(req.session.user){
		if(Number(req.session.user.role)==30){
			try{
				var nalozi = await naloziDB.find({majstor:req.session.user.nalozi,statusNaloga:"Storniran"}).toArray();
				var nalozi2024 = await nalozi2024DB.find({majstor:req.session.user.nalozi,statusNaloga:"Storniran"}).toArray()
				for(var i=0;i<nalozi2024.length;i++){
					nalozi.push(nalozi2024[i])
				}
				for(var i=0;i<nalozi.length;i++){
					delete nalozi[i]._id;
					delete nalozi[i].uniqueId;
					delete nalozi[i].digitalizacija;
					delete nalozi[i].opis;
					delete nalozi[i].vrstaRada;
					delete nalozi[i].kategorijeRadova;
					delete nalozi[i].punaAdresa;
					delete nalozi[i].obracun;
					delete nalozi[i].ukupanIznos;
					delete nalozi[i].faktura;
					delete nalozi[i].prijemnica;
				}
				res.render("podizvodjaci/otvoreniNalozi",{
					pageTitle:"Сторнирани налози",
					user: req.session.user,
					nalozi: nalozi
				})
			}catch(err){
				logError(err);
				res.render("message",{
					pageTitle: "Програмска грешка",
					user: req.session.user,
					message: "<div class=\"text\">Дошло је до грешке у бази податка 1243.</div>"
				});
			}
		}else{
			res.render("message",{
				pageTitle: "Грешка",
				user: req.session.user,
				message: "<div class=\"text\">Ваш налог није овлашћен да види ову страницу.</div>"
			});
		}
	}else{
		res.redirect("/login?url="+encodeURIComponent(req.url));
	}
});

server.get('/podizvodjac/zavrseniNalozi',async (req,res)=>{
	if(req.session.user){
		if(Number(req.session.user.role)==30){
			try{
				var nalozi = await naloziDB.find({majstor:req.session.user.nalozi,statusNaloga:{$in:["Završeno","Nalog u Stambenom","Spreman za fakturisanje","Spreman za obračun"]}}).toArray();
				var nalozi2024 = await nalozi2024DB.find({majstor:req.session.user.nalozi,statusNaloga:{$in:["Završeno","Nalog u Stambenom","Spreman za fakturisanje","Spreman za obračun"]}}).toArray();
				for(var i=0;i<nalozi2024.length;i++){
					nalozi.push(nalozi2024[i])
				}
				for(var i=0;i<nalozi.length;i++){
					delete nalozi[i]._id;
					delete nalozi[i].uniqueId;
					delete nalozi[i].digitalizacija;
					delete nalozi[i].opis;
					delete nalozi[i].vrstaRada;
					delete nalozi[i].kategorijeRadova;
					delete nalozi[i].punaAdresa;
					delete nalozi[i].ukupanIznos;
					delete nalozi[i].faktura;
					delete nalozi[i].prijemnica;
					delete nalozi[i].ukupanIznos;
				}
				var obrada = ["Nalog u Stambenom","Spreman za fakturisanje","Spreman za obračun"];
				for(var i=0;i<nalozi.length;i++){
					if(obrada.indexOf(nalozi[i].statusNaloga)>=0){
						nalozi[i].statusNaloga = "У обради";
					}
				}
				var cenovnikZaPrikaz = [];
				if(req.session.user.nalozi=="SeHQZ--1672650353244" || req.session.user.nalozi=="IIwY4--1672650358507" || req.session.user.nalozi=="mile--1672650353244"){
					cenovnikZaPrikaz = cenovnikHigh;
				}else{
					cenovnikZaPrikaz = cenovnikHigh;
				}
				res.render("podizvodjaci/zavrseniNalozi",{
					pageTitle:"Завршени налози",
					user: req.session.user,
					cenovnik: cenovnikZaPrikaz,
					nalozi: nalozi
				})
			}catch(err){
				logError(err);
				res.render("message",{
					pageTitle: "Програмска грешка",
					user: req.session.user,
					message: "<div class=\"text\">Дошло је до грешке у бази податка 1243.</div>"
				});
			}
		}else{
			res.render("message",{
				pageTitle: "Грешка",
				user: req.session.user,
				message: "<div class=\"text\">Ваш налог није овлашћен да види ову страницу.</div>"
			});
		}
	}else{
		res.redirect("/login?url="+encodeURIComponent(req.url));
	}
});


server.get('/podizvodjac/vraceniNalozi',async (req,res)=>{
	if(req.session.user){
		if(Number(req.session.user.role)==30){
			try{
				var nalozi = await naloziDB.find({majstor:req.session.user.nalozi,statusNaloga:"Vraćen"}).toArray();
				var nalozi2024 = await nalozi2024DB.find({majstor:req.session.user.nalozi,statusNaloga:"Vraćen"}).toArray();
				for(var i=0;i<nalozi2024.length;i++){
					nalozi.push(nalozi2024[i])
				}
				for(var i=0;i<nalozi.length;i++){
					delete nalozi[i]._id;
					delete nalozi[i].uniqueId;
					delete nalozi[i].digitalizacija;
					delete nalozi[i].opis;
					delete nalozi[i].vrstaRada;
					delete nalozi[i].kategorijeRadova;
					delete nalozi[i].punaAdresa;
					delete nalozi[i].ukupanIznos;
					delete nalozi[i].faktura;
					delete nalozi[i].prijemnica;
					delete nalozi[i].ukupanIznos;
				}
				var cenovnikZaPrikaz = [];
				if(req.session.user.nalozi=="SeHQZ--1672650353244" || req.session.user.nalozi=="IIwY4--1672650358507" || req.session.user.nalozi=="mile--1672650353244"){
					cenovnikZaPrikaz = cenovnikHigh;
				}else{
					cenovnikZaPrikaz = cenovnikLow;
				}
				res.render("podizvodjaci/vraceniNalozi",{
					pageTitle:"Враћени налози",
					user: req.session.user,
					cenovnik: cenovnikZaPrikaz,
					nalozi: nalozi
				})
			}catch(err){
				logError(err);
				res.render("message",{
					pageTitle: "Програмска грешка",
					user: req.session.user,
					message: "<div class=\"text\">Дошло је до грешке у бази податка 1243.</div>"
				});
			}
		}else{
			res.render("message",{
				pageTitle: "Грешка",
				user: req.session.user,
				message: "<div class=\"text\">Ваш налог није овлашћен да види ову страницу.</div>"
			});
		}
	}else{
		res.redirect("/login?url="+encodeURIComponent(req.url));
	}
});

server.get('/podizvodjac/obradjeniNalozi',async (req,res)=>{
	if(req.session.user){
		if(Number(req.session.user.role)==30){
			try{
				var nalozi = await naloziDB.find({majstor:req.session.user.nalozi,statusNaloga:"Fakturisan"}).toArray()
				var nalozi2024 = await nalozi2024DB.find({majstor:req.session.user.nalozi,statusNaloga:"Fakturisan"}).toArray();
				for(var i=0;i<nalozi2024.length;i++){
					nalozi.push(nalozi2024[i]);
				}
				var specifikacije = await specifikacijePodizvodjacaDB.find({}).toArray();
				var naloziNaSpecifikacijama = [];
				for(var i=0;i<specifikacije.length;i++){
					for(var j=0;j<specifikacije[i].nalozi.length;j++){
						naloziNaSpecifikacijama.push(specifikacije[i].nalozi[j].broj);
					}
				}
				for(var i=0;i<nalozi.length;i++){
					if(naloziNaSpecifikacijama.indexOf(nalozi[i].broj)>=0){
						nalozi.splice(i,1);
						i--;
					}
				}
				for(var i=0;i<nalozi.length;i++){
					delete nalozi[i]._id;
					delete nalozi[i].uniqueId;
					delete nalozi[i].opis;
					delete nalozi[i].vrstaRada;
					delete nalozi[i].kategorijeRadova;
					delete nalozi[i].punaAdresa;
					delete nalozi[i].ukupanIznos;
					delete nalozi[i].faktura;
					delete nalozi[i].prijemnica;
					delete nalozi[i].ukupanIznos;
					nalozi[i].statusNaloga = "Možete fakturisati";
				}
				var cenovnikZaPrikaz = [];
				if(req.session.user.nalozi=="SeHQZ--1672650353244" || req.session.user.nalozi=="IIwY4--1672650358507" || req.session.nalozi=="mile--1672650353244"){
					cenovnikZaPrikaz = cenovnikHigh;
				}else{
					cenovnikZaPrikaz = cenovnikLow;
				}
				res.render("podizvodjaci/obradjeniNalozi",{
					pageTitle:"Обрађени налози",
					cenovnik: cenovnikZaPrikaz,
					cenovnik2024: cenovnikHigh2024,
					user: req.session.user,
					nalozi: nalozi
				})
			}catch(err){
				logError(err);
				res.render("message",{
					pageTitle: "Програмска грешка",
					user: req.session.user,
					message: "<div class=\"text\">Дошло је до грешке у бази податка 3426.</div>"
				});
			}
		}else{
			res.render("message",{
				pageTitle: "Грешка",
				user: req.session.user,
				message: "<div class=\"text\">Ваш налог није овлашћен да види ову страницу.</div>"
			});
		}
	}else{
		res.redirect("/login?url="+encodeURIComponent(req.url));
	}
});

server.post('/podizvodjac/nova-specifikacija',async (req,res)=>{
	if(req.session.user){
		if(Number(req.session.user.role)==30){
			var specifikacija = JSON.parse(req.body.json);
			specifikacija.odobrena = "0";
			specifikacija.uniqueId = new Date().getTime()+"--"+generateId(7);
			specifikacija.user = req.session.user;
			specifikacija.datum = {};
			specifikacija.datum.datetime = new Date().getTime();
			specifikacija.datum.datum = getDateAsStringForDisplay(new Date());
			specifikacijePodizvodjacaDB.insertOne(specifikacija)
			.then((dbResponse)=>{
				res.redirect("/podizvodjac/specifikacija/"+specifikacija.uniqueId);
			}).catch((err)=>{
				logError(error);
				res.render("message",{
					pageTitle: "Програмска грешка",
					user: req.session.user,
					message: "<div class=\"text\">Дошло је до грешке у бази податка 3481.</div>"
				})
			});
		}else{
			res.render("message",{
				pageTitle: "Грешка",
				user: req.session.user,
				message: "<div class=\"text\">Ваш налог није овлашћен да види ову страницу.</div>"
			});
		}
	}else{
		res.redirect("/login");
	}
})

server.post('/podizvodjac/obrisi-specifikaciju',async (req,res)=>{
	if(req.session.user){
		if(Number(req.session.user.role)==30){
			specifikacijePodizvodjacaDB.find({uniqueId:req.body.specifikacija}).toArray()
			.then((specifikacije)=>{
				if(specifikacije.length>0){
					if(specifikacije[0].user.email==req.session.user.email){
						specifikacijePodizvodjacaDB.deleteOne({uniqueId:req.body.specifikacija})
						.then((dbResponse)=>{
							res.render("message",{
								pageTitle: "Успешно обрисано",
								user: req.session.user,
								message: "<div class=\"text\">Спецификација успешно обрисана.</div>"
							})
						}).catch((err)=>{
							logError(error);
							res.render("message",{
								pageTitle: "Програмска грешка",
								user: req.session.user,
								message: "<div class=\"text\">Дошло је до грешке у бази податка 3539.</div>"
							})
						});
					}else{
						res.render("message",{
							pageTitle: "Грешка",
							user: req.session.user,
							message: "<div class=\"text\">Спецификација није ваша.</div>"
						});
					}
				}else{
					res.render("message",{
						pageTitle: "Грешка",
						user: req.session.user,
						message: "<div class=\"text\">Непостојећа спецификација.</div>"
					});
				}
			})
			.catch((error)=>{
				logError(error);
				res.render("message",{
					pageTitle: "Програмска грешка",
					user: req.session.user,
					message: "<div class=\"text\">Дошло је до грешке у бази податка 3481.</div>"
				});
			})
		}else{
			res.render("message",{
				pageTitle: "Грешка",
				user: req.session.user,
				message: "<div class=\"text\">Ваш налог није овлашћен да види ову страницу.</div>"
			});
		}
	}else{
		res.redirect("/login");
	}
})

server.get('/podizvodjac/specifikacija/:uniqueId',async (req,res)=>{
	if(req.session.user){
		if(Number(req.session.user.role)==30){
			specifikacijePodizvodjacaDB.find({uniqueId:req.params.uniqueId}).toArray()
			.then((specifikacije)=>{
				res.render("podizvodjaci/specifikacija",{
					pageTitle:"Спецификација",
					specifikacija: specifikacije[0],
					user: req.session.user
				})
			})
			.catch((error)=>{
				logError(error)
				res.render("message",{
					pageTitle: "Програмска грешка",
					user: req.session.user,
					message: "<div class=\"text\">Дошло је до грешке у бази податка 3481.</div>"
				})
			})
		}else{
			res.render("message",{
				pageTitle: "Грешка",
				user: req.session.user,
				message: "<div class=\"text\">Ваш налог није овлашћен да види ову страницу.</div>"
			});
		}
	}else{
		res.redirect("/login?url="+encodeURIComponent(req.url));
	}
})

server.get('/podizvodjac/fakturisaniNalozi',async (req,res)=>{
	if(req.session.user){
		if(Number(req.session.user.role)==30){
			try{
				var nalozi = await naloziDB.find({majstor:req.session.user.nalozi,statusNaloga:"Fakturisan"}).toArray();
				var nalozi2024 = await nalozi2024DB.find({majstor:req.session.user.nalozi,statusNaloga:"Fakturisan"}).toArray();
				for(var i=0;i<nalozi2024.length;i++){
					nalozi.push(nalozi2024[i])
				}
				for(var i=0;i<nalozi.length;i++){
					delete nalozi[i]._id;
					delete nalozi[i].uniqueId;
					delete nalozi[i].digitalizacija;
					delete nalozi[i].opis;
					delete nalozi[i].vrstaRada;
					delete nalozi[i].kategorijeRadova;
					delete nalozi[i].punaAdresa;
					delete nalozi[i].obracun;
					delete nalozi[i].ukupanIznos;
					delete nalozi[i].faktura;
					delete nalozi[i].prijemnica;
				}
				res.render("podizvodjaci/fakturisaniNalozi",{
					pageTitle:"Фактурисани налози",
					user: req.session.user,
					nalozi: nalozi
				})
			}catch(err){
				logError(err);
				res.render("message",{
					pageTitle: "Програмска грешка",
					user: req.session.user,
					message: "<div class=\"text\">Дошло је до грешке у бази податка 1311.</div>"
				});
			}
		}else{
			res.render("message",{
				pageTitle: "Грешка",
				user: req.session.user,
				message: "<div class=\"text\">Ваш налог није овлашћен да види ову страницу.</div>"
			});
		}
	}else{
		res.redirect("/login?url="+encodeURIComponent(req.url));
	}
});

server.get('/podizvodjac/ucinak',async (req,res)=>{
	if(req.session.user){
		if(Number(req.session.user.role)==30){
			res.render("podizvodjaci/ucinak",{
				pageTitle:"Учинак",
				user: req.session.user
			})
		}else{
			res.render("message",{
				pageTitle: "Грешка",
				user: req.session.user,
				message: "<div class=\"text\">Ваш налог није овлашћен да види ову страницу.</div>"
			});
		}
	}else{
		res.redirect("/login?url="+encodeURIComponent(req.url));
	}
});

server.get('/podizvodjac/specifikacije',async (req,res)=>{
	if(req.session.user){
		if(Number(req.session.user.role)==30){
			specifikacijePodizvodjacaDB.find({"user.email":req.session.user.email}).toArray()
			.then((specifikacije)=>{
				res.render("podizvodjaci/specifikacije",{
					pageTitle:"Спецификације",
					specifikacije: specifikacije,
					user: req.session.user
				})
			})
			.catch((error)=>{
				logError(error);
				res.render("message",{
					pageTitle: "Програмска грешка",
					user: req.session.user,
					message: "<div class=\"text\">Дошло је до грешке у бази податка 3626.</div>"
				});
			})
			
		}else{
			res.render("message",{
				pageTitle: "Грешка",
				user: req.session.user,
				message: "<div class=\"text\">Ваш налог није овлашћен да види ову страницу.</div>"
			});
		}
	}else{
		res.redirect("/login?url="+encodeURIComponent(req.url));
	}
});

server.get('/magacioner/stanje',async (req,res)=>{
	if(req.session.user){
		if(Number(req.session.user.role)==50){
			proizvodiDB.find({}).toArray()
			.then((proizvodi)=>{
				magacinUlaziDB.find({}).toArray()
				.then((ulazi)=>{
					magacinReversiDB.find({}).toArray()
					.then((reversi)=>{
						majstoriDB.find({}).toArray()
						.then((majstori)=>{
							res.render("magacioner/stanje",{
								pageTitle:"Стање",
								proizvodi: proizvodi,
								ulazi: ulazi,
								reversi: reversi,
								majstori: majstori,
								user: req.session.user
							})
						})
						.catch((error)=>{
							logError(error);
							res.render("message",{
								pageTitle: "Програмска грешка",
								user: req.session.user,
								message: "<div class=\"text\">Дошло је до грешке у бази податка 2626.</div>"
							})
						})
						
					})
					.catch((error)=>{
						logError(error);
						res.render("message",{
							pageTitle: "Програмска грешка",
							user: req.session.user,
							message: "<div class=\"text\">Дошло је до грешке у бази податка 2623.</div>"
						})
					})
				})
				.catch((error)=>{
					logError(error);
					res.render("message",{
						pageTitle: "Програмска грешка",
						user: req.session.user,
						message: "<div class=\"text\">Дошло је до грешке у бази податка 2621.</div>"
					})
				})
			})
			.catch((error)=>{
				logError(error);
				res.render("message",{
					pageTitle: "Програмска грешка",
					user: req.session.user,
					message: "<div class=\"text\">Дошло је до грешке у бази податка 2620.</div>"
				})
			})
		}else{
			res.render("message",{
				pageTitle: "Грешка",
				user: req.session.user,
				message: "<div class=\"text\">Ваш налог није овлашћен да види ову страницу.</div>"
			});
		}
	}else{
		res.redirect("/login?url="+encodeURIComponent(req.url));
	}
});



server.post('/izmeni-proizvod', async (req, res)=> {
	if(req.session.user){
		if(Number(req.session.user.role)==50){
			var json = JSON.parse(req.body.json);
			if(json.popis){
				var setObj	=	{ $set: {
										alarm:json.alarm,
										stanje:json.popis,
										price:json.price,
										datumPopisa:getDateAsStringForDisplay(new Date()),
										datetimePopisa: new Date().getTime()
									}
							};
			}else{
				var setObj	=	{ $set: {
										alarm:json.alarm,
										price:json.price
									}
							};
			}
			
			proizvodiDB.updateOne({uniqueId:json.uniqueId},setObj)
			.then((dbResponse)=>{
				res.redirect("/magacioner/stanje");
			})
			.catch((error)=>{
				logError(error);
				res.render("message",{
					pageTitle: "Програмска грешка",
					user: req.session.user,
					message: "<div class=\"text\">Дошло је до грешке у бази податка 2929.</div>"
				})
			})
		}else{
			res.render("message",{
				pageTitle: "Грешка",
				user: req.session.user,
				message: "<div class=\"text\">Ваш налог није овлашћен да види ову страницу.</div>"
			});
		}
	}else{
		res.redirect("/login");	
	}
});

server.post('/sacuvaj-ulaz', async (req, res)=> {
	if(req.session.user){
		if(Number(req.session.user.role)==50){
			var json = JSON.parse(req.body.json);
			var insertJson = {};
			insertJson.uniqueId = generateId(7)+"--"+new Date().getTime();
			insertJson.productUniqueId = json.uniqueId;
			insertJson.quantity = json.kolicina;
			insertJson.datum = getDateAsStringForDisplay(new Date());
			insertJson.datetime = new Date().getTime();

			magacinUlaziDB.insertOne(insertJson)
			.then((dbResponse)=>{
				res.redirect("/magacioner/stanje");
			}).catch((err)=>{
				logError(error);
				res.render("message",{
					pageTitle: "Програмска грешка",
					user: req.session.user,
					message: "<div class=\"text\">Дошло је до грешке у бази податка 2929.</div>"
				})
			});
		}else{
			res.render("message",{
				pageTitle: "Грешка",
				user: req.session.user,
				message: "<div class=\"text\">Ваш налог није овлашћен да види ову страницу.</div>"
			});
		}
	}else{
		res.redirect("/login");	
	}
});

server.post('/obrisi-ulaz', async (req, res)=> {
	if(req.session.user){
		if(Number(req.session.user.role)==50){

			magacinUlaziDB.deleteOne({uniqueId:req.body.id})
			.then((dbResponse)=>{
				res.redirect("/magacioner/stanje");
			}).catch((err)=>{
				logError(error);
				res.render("message",{
					pageTitle: "Програмска грешка",
					user: req.session.user,
					message: "<div class=\"text\">Дошло је до грешке у бази податка 3022.</div>"
				})
			});
		}else{
			res.render("message",{
				pageTitle: "Грешка",
				user: req.session.user,
				message: "<div class=\"text\">Ваш налог није овлашћен да види ову страницу.</div>"
			});
		}
	}else{
		res.redirect("/login");	
	}
});

server.get('/magacioner/noviRevers',async (req,res)=>{
	if(req.session.user){
		if(Number(req.session.user.role)==50){
			proizvodiDB.find({}).toArray()
			.then((proizvodi)=>{
				majstoriDB.find({}).toArray()
				.then((majstori)=>{
					res.render("magacioner/noviRevers",{
						pageTitle:"Нови реверс",
						proizvodi: proizvodi,
						majstori: majstori,
						user: req.session.user
					})
				})
				.catch((error)=>{
					logError(error);
					res.render("message",{
						pageTitle: "Програмска грешка",
						user: req.session.user,
						message: "<div class=\"text\">Дошло је до грешке у бази податка 3026.</div>"
					})
				})	
			})
			.catch((error)=>{
				logError(error);
				res.render("message",{
					pageTitle: "Програмска грешка",
					user: req.session.user,
					message: "<div class=\"text\">Дошло је до грешке у бази податка 3035.</div>"
				})
			})
		}else{
			res.render("message",{
				pageTitle: "Грешка",
				user: req.session.user,
				message: "<div class=\"text\">Ваш налог није овлашћен да види ову страницу.</div>"
			});
		}
	}else{
		res.redirect("/login?url="+encodeURIComponent(req.url));
	}
});

server.post('/novi-revers', async (req, res)=> {
	if(req.session.user){
		if(Number(req.session.user.role)==50){
			var json = JSON.parse(req.body.json);
			json.uniqueId = generateId(7)+"--"+new Date().getTime();
			json.datetime = Number(json.datetime);
			magacinReversiDB.insertOne(json)
			.then((dbResponse)=>{
				res.redirect("/magacioner/revers/"+json.uniqueId);
			}).catch((err)=>{
				logError(error);
				res.render("message",{
					pageTitle: "Програмска грешка",
					user: req.session.user,
					message: "<div class=\"text\">Дошло је до грешке у бази податка 3062.</div>"
				})
			});
		}else{
			res.render("message",{
				pageTitle: "Грешка",
				user: req.session.user,
				message: "<div class=\"text\">Ваш налог није овлашћен да види ову страницу.</div>"
			});
		}
	}else{
		res.redirect("/login");	
	}
});

server.post('/izmeni-revers', async (req, res)=> {
	if(req.session.user){
		if(Number(req.session.user.role)==50){
			var json = JSON.parse(req.body.json);
			var setObj	=	{ $set: {
				majstor: json.majstor,
				zaduzenje: json.zaduzenje,
				nalog: json.nalog,
				adresa: json.adresa,
				datetime: Number(json.datetime),
				datum: json.datum
			}};
			magacinReversiDB.updateOne({uniqueId:json.uniqueId},setObj)
			.then((dbResponse)=>{
				res.redirect("/magacioner/revers/"+json.uniqueId);
			})
			.catch((error)=>{
				logError(error);
				res.render("message",{
					pageTitle: "Програмска грешка",
					user: req.session.user,
					message: "<div class=\"text\">Дошло је до грешке у бази податка 3094.</div>"
				})
			})
		}else{
			res.render("message",{
				pageTitle: "Грешка",
				user: req.session.user,
				message: "<div class=\"text\">Ваш налог није овлашћен да види ову страницу.</div>"
			});
		}
	}else{
		res.redirect("/login");	
	}
});

server.post('/obrisi-revers', async (req, res)=> {
	if(req.session.user){
		if(Number(req.session.user.role)==50){
			magacinReversiDB.deleteOne({uniqueId:req.body.id})
			.then((dbResponse)=>{
				res.render("message",{
					pageTitle: "Обрисан реверс",
					user: req.session.user,
					message: "<div class=\"text\">Успешно сте обрисали реверс.</div>"
				});
			})
			.catch((error)=>{
				logError(error);
				res.render("message",{
					pageTitle: "Програмска грешка",
					user: req.session.user,
					message: "<div class=\"text\">Дошло је до грешке у бази податка 3134.</div>"
				});
			})
		}else{
			res.render("message",{
				pageTitle: "Грешка",
				user: req.session.user,
				message: "<div class=\"text\">Ваш налог није овлашћен да види ову страницу.</div>"
			});
		}
	}else{
		res.redirect("/login");	
	}
});

server.get('/magacioner/revers/:uniqueId',async (req,res)=>{
	if(req.session.user){
		if(Number(req.session.user.role)==50){
			try{
				var proizvodi = await proizvodiDB.find({}).toArray();
				var majstori = await majstoriDB.find({uniqueId:{$nin:podizvodjaci}}).toArray();
				var reversi = await magacinReversiDB.find({uniqueId:req.params.uniqueId}).toArray();
				if(reversi.length==0){
					return res.render("message",{
								pageTitle: "Грешка",
								user: req.session.user,
								message: "<div class=\"text\">Реверс није у бази података или је обрисан.</div>"
							});
				}else{
					var nalozi = await naloziDB.find({broj:reversi[0].nalog}).toArray();
					var nalozi2024 = await nalozi2024DB.find({broj:reversi[0].nalog}).toArray();
					var nalog = {};
					if(nalozi.length>0){
						nalog = nalozi[0]
					}else if(nalozi2024.length>0){
						nalog = nalozi2024[0]
					}
					res.render("magacioner/revers",{
						pageTitle:"Rеверс по налогу "+reversi[0].nalog,
						proizvodi: proizvodi,
						majstori: majstori,
						nalog: nalog,
						revers: reversi[0],
						user: req.session.user
					})
				}
			}catch(err){
				logError(err);
				res.render("message",{
					pageTitle: "Програмска грешка",
					user: req.session.user,
					message: "<div class=\"text\">Дошло је до грешке у бази податка 3026.</div>"
				})
			}
		}else{
			res.render("message",{
				pageTitle: "Грешка",
				user: req.session.user,
				message: "<div class=\"text\">Ваш налог није овлашћен да види ову страницу.</div>"
			});
		}
	}else{
		res.redirect("/login?url="+encodeURIComponent(req.url));
	}
});

server.get('/magacioner/pretragaReversa',async (req,res)=>{
	if(req.session.user){
		if(Number(req.session.user.role)==50){
			res.render("magacioner/pretragaReversa",{
				pageTitle:"Претрага реверса",
				user: req.session.user
			})
		}else{
			res.render("message",{
				pageTitle: "Грешка",
				user: req.session.user,
				message: "<div class=\"text\">Ваш налог није овлашћен да види ову страницу.</div>"
			});
		}
	}else{
		res.redirect("/login?url="+encodeURIComponent(req.url));
	}
});


server.get('/brzaPretragaReversa/:brojNaloga', async (req, res)=> {
	if(req.session.user){
		if(Number(req.session.user.role)==50){
			try{
				var reversi = await magacinReversiDB.find({nalog:req.params.brojNaloga}).toArray();
				var nalozi = await naloziDB.find({broj:req.params.brojNaloga.toString()}).toArray();
				var majstori = await majstoriDB.find({}).toArray();
				var proizvodi = await proizvodiDB.find({}).toArray();
				res.render("magacioner/rezultatPretrage",{
					pageTitle: "Резлтати претраге реверса по налогу "+req.params.brojNaloga,
					user: req.session.user,
					reversi: reversi,
					majstori: majstori,
					proizvodi: proizvodi,
					nalozi: nalozi
				});
			}catch(err){
				logError(err);
				res.render("message",{
					pageTitle: "Програмска грешка",
					user: req.session.user,
					message: "<div class=\"text\">Дошло је до грешке у бази податка 3264.</div>"
				});
			}
		}else{
			res.render("message",{
				pageTitle: "Грешка",
				user: req.session.user,
				message: "<div class=\"text\">Ваш налог није овлашћен да види ову страницу.</div>"
			});
		}
	}else{
		res.redirect("/login");	
	} 
});

server.post('/pretraga-reversa', async (req, res)=> {
	if(req.session.user){
		if(Number(req.session.user.role)==50){
			try{
				var reversi = await magacinReversiDB.find({nalog:req.body.brojnaloga}).toArray();
				var nalozi = await naloziDB.find({broj:req.body.brojnaloga.toString()}).toArray();
				var majstori = await majstoriDB.find({}).toArray();
				var proizvodi = await proizvodiDB.find({}).toArray();
				res.render("magacioner/rezultatPretrage",{
					pageTitle: "Резлтати претраге реверса по налогу "+req.body.brojnaloga,
					user: req.session.user,
					reversi: reversi,
					majstori: majstori,
					proizvodi: proizvodi,
					nalozi: nalozi
				});
			}catch(err){
				logError(err);
				res.render("message",{
					pageTitle: "Програмска грешка",
					user: req.session.user,
					message: "<div class=\"text\">Дошло је до грешке у бази податка 3264.</div>"
				});
			}
		}else{
			res.render("message",{
				pageTitle: "Грешка",
				user: req.session.user,
				message: "<div class=\"text\">Ваш налог није овлашћен да види ову страницу.</div>"
			});
		}
	}else{
		res.redirect("/login");	
	} 
});




server.get('/magacioner/danasnjiReversi', async (req, res)=> {
	if(req.session.user){
		if(Number(req.session.user.role)==50){
			var today = new Date();
			var dateString = today.getDate().toString().length==1 ? "0"+today.getDate() : today.getDate();
			var monthString = eval(today.getMonth()+1).toString().length==1 ? "0"+eval(today.getMonth()+1) : eval(today.getMonth()+1);
			try{
				var reversi = await magacinReversiDB.find({datum:{$regex:dateString+"."+monthString+"."+new Date().getFullYear()}}).toArray();
				var naloziToFind = [];
				for(var i=0;i<reversi.length;i++){
					naloziToFind.push(reversi[i].nalog);
				}
				var nalozi = await naloziDB.find({broj:{$in:naloziToFind}}).toArray();
				var nalozi2024 = await nalozi2024DB.find({broj:{$in:naloziToFind}}).toArray();
				for(var i=0;i<nalozi2024.length;i++){
					nalozi.push(nalozi2024[i])
				}
				var majstori = await majstoriDB.find({}).toArray();
				var proizvodi = await proizvodiDB.find({}).toArray();
				res.render("magacioner/rezultatPretrage",{
					pageTitle: "Данашњи реверси",
					user: req.session.user,
					reversi: reversi,
					majstori: majstori,
					proizvodi: proizvodi,
					nalozi: nalozi
				});
			}catch(err){
				logError(err);
				res.render("message",{
					pageTitle: "Програмска грешка",
					user: req.session.user,
					message: "<div class=\"text\">Дошло је до грешке у бази податка 3449.</div>"
				});
			}
		}else{
			res.render("message",{
				pageTitle: "Грешка",
				user: req.session.user,
				message: "<div class=\"text\">Ваш налог није овлашћен да види ову страницу.</div>"
			});
		}
	}else{
		res.redirect("/login?url="+encodeURIComponent(req.url));
	} 
});

server.get('/magacioner/jucerasnjiReversi', async (req, res)=> {
	if(req.session.user){
		if(Number(req.session.user.role)==50){
			var today = new Date();
			today.setDate(today.getDate()-1);
			var dateString = today.getDate().toString().length==1 ? "0"+today.getDate() : today.getDate();
			var monthString = eval(today.getMonth()+1).toString().length==1 ? "0"+eval(today.getMonth()+1) : eval(today.getMonth()+1);
			try{
				var reversi = await magacinReversiDB.find({datum:{$regex:dateString+"."+monthString+"."+new Date().getFullYear()}}).toArray();
				var naloziToFind = [];
				for(var i=0;i<reversi.length;i++){
					naloziToFind.push(reversi[i].nalog);
				}
				var nalozi = await naloziDB.find({broj:{$in:naloziToFind}}).toArray();
				var nalozi2024 = await nalozi2024DB.find({broj:{$in:naloziToFind}}).toArray();
				for(var i=0;i<nalozi2024.length;i++){
					nalozi.push(nalozi2024[i])
				}
				var majstori = await majstoriDB.find({}).toArray();
				var proizvodi = await proizvodiDB.find({}).toArray();
				res.render("magacioner/rezultatPretrage",{
					pageTitle: "Јучерашњи реверси",
					user: req.session.user,
					reversi: reversi,
					majstori: majstori,
					proizvodi: proizvodi,
					nalozi: nalozi
				});
			}catch(err){
				logError(err);
				res.render("message",{
					pageTitle: "Програмска грешка",
					user: req.session.user,
					message: "<div class=\"text\">Дошло је до грешке у бази податка 3439.</div>"
				});
			}
		}else{
			res.render("message",{
				pageTitle: "Грешка",
				user: req.session.user,
				message: "<div class=\"text\">Ваш налог није овлашћен да види ову страницу.</div>"
			});
		}
	}else{
		res.redirect("/login?url="+encodeURIComponent(req.url));
	} 
});

server.get('/magacioner/prekojucerasnjiReversi', async (req, res)=> {
	if(req.session.user){
		if(Number(req.session.user.role)==50){
			var today = new Date();
			today.setDate(today.getDate()-2);
			var dateString = today.getDate().toString().length==1 ? "0"+today.getDate() : today.getDate();
			var monthString = eval(today.getMonth()+1).toString().length==1 ? "0"+eval(today.getMonth()+1) : eval(today.getMonth()+1);
			try{
				var reversi = await magacinReversiDB.find({datum:{$regex:dateString+"."+monthString+"."+today.getFullYear()}}).toArray();
				var naloziToFind = [];
				for(var i=0;i<reversi.length;i++){
					naloziToFind.push(reversi[i].nalog);
				}
				var nalozi = await naloziDB.find({broj:{$in:naloziToFind}}).toArray();
				var nalozi2024 = await nalozi2024DB.find({broj:{$in:naloziToFind}}).toArray();
				for(var i=0;i<nalozi2024.length;i++){
					nalozi.push(nalozi2024[i])
				}
				var proizvodi = await proizvodiDB.find({}).toArray();
				var majstori = await majstoriDB.find({}).toArray();
				res.render("magacioner/rezultatPretrage",{
					pageTitle: "Прекојучерашњи реверси",
					user: req.session.user,
					reversi: reversi,
					majstori: majstori,
					proizvodi: proizvodi,
					nalozi: nalozi
				});		
			}catch(err){
				logError(err);
				res.render("message",{
					pageTitle: "Програмска грешка",
					user: req.session.user,
					message: "<div class=\"text\">Дошло је до грешке у бази податка 3449.</div>"
				});
			}
				

			
		}else{
			res.render("message",{
				pageTitle: "Грешка",
				user: req.session.user,
				message: "<div class=\"text\">Ваш налог није овлашћен да види ову страницу.</div>"
			});
		}
	}else{
		res.redirect("/login?url="+encodeURIComponent(req.url));
	} 
});

server.get('/magacioner/utroseniMaterijal',async (req,res)=>{
	if(req.session.user){
		if(Number(req.session.user.role)==50){
			try{
				var proizvodi = await proizvodiDB.find({}).toArray();
				var today = new Date();
			  var dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
			  var mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

			  var monday = new Date(today);
			  monday.setDate(today.getDate() + mondayOffset);

			  var week = [];
			  for (var i = 0; i < 7; i++) {
			    var date = new Date(monday);
			    date.setDate(monday.getDate() + i);
			    week.push(getDateAsStringForDisplay(date));
			  }
			  var reversi = await magacinReversiDB.find({datum:{$in:week}}).toArray()
			  res.render("magacioner/utroseniMaterijal",{
					pageTitle:"Утрошени материјал ове недеље",
					proizvodi: proizvodi,
					reversi: reversi,
					user: req.session.user
				})
			}catch(error){
				logError(error);
				res.render("message",{
					pageTitle: "Програмска грешка",
					user: req.session.user,
					message: "<div class=\"text\">Дошло је до грешке у бази податка 2623.</div>"
				})
			}
		}else{
			res.render("message",{
				pageTitle: "Грешка",
				user: req.session.user,
				message: "<div class=\"text\">Ваш налог није овлашћен да види ову страницу.</div>"
			});
		}
	}else{
		res.redirect("/login?url="+encodeURIComponent(req.url));
	}
});

server.post('/fakturisi', async (req, res)=> {
	if(req.session.user){
		if(Number(req.session.user.role)==40){
			var json = JSON.parse(req.body.json);
			var samoBroj = 0;
			try{
				samoBroj = json.brojFakture.toLowerCase().split(".").join("").split("s-")[1].split("/202")[0];
			}catch(err){
				logError(err);
			}
			var setObj	=	{ $set: {
											"faktura.broj": 	json.brojFakture,
											"faktura.samoBroj": samoBroj,
											"faktura.pdv": 	json.pdv
										}};
			try{
				var nalog2024 = false;
				var nalozi = await naloziDB.find({broj:json.brojNaloga.toString()}).toArray();
				var nalozi2024 = await nalozi2024DB.find({broj:json.brojNaloga.toString()}).toArray();
				if(nalozi.length>0){
					await naloziDB.updateOne({broj:json.brojNaloga.toString()},setObj);
					json.vik = "2025";
				}else if(nalozi2024.length>0){
					nalog2024 = true;
					await nalozi2024DB.updateOne({broj:json.brojNaloga.toString()},setObj)
					json.vik = "2024";
				}

				const worker 		=	new Worker("./fakturaWorker.js",{ env:SHARE_ENV});
				worker.postMessage(JSON.stringify(json));
				worker.on("message",async (data)=>{
					try{
						var fakturaResponse = JSON.parse(data);
						if(fakturaResponse.error>0){
							//Greska
							res.render("message",{
								pageTitle: "Грешка",
								user: req.session.user,
								message: "<div class=\"text\">"+fakturaResponse.message+"<br>&nbsp;<br>"+fakturaResponse.messageString+"</div>"
							});
						}else{
							var setObj	=	{ $set: {
												statusNaloga: 		"Fakturisan",
												"faktura.premijus": 	fakturaResponse.faktura,
												"faktura.datum.datetime": new Date().getTime(),
												"faktura.datum.datum": getDateAsStringForDisplay(new Date()),
											}};
							if(nalog2024){
								await nalozi2024DB.updateOne({broj:json.brojNaloga.toString()},setObj)
							}else{
								await naloziDB.updateOne({broj:json.brojNaloga.toString()},setObj)
							}
							res.redirect("/nalog/"+json.brojNaloga);
							
						}
						
					}catch(err){
						logError(err);
						res.render("message",{
							pageTitle: "Грешка",
							user: req.session.user,
							message: "<div class=\"text\">Грешка на порталу 3410. Није могуће утврдити шта се десило на СЕФ-у, проверите шта се десило.</div>"
						});
					}
				});
			}catch(err){
				logError(err)
				res.render("message",{
					pageTitle: "Грешка",
					user: req.session.user,
					message: "<div class=\"text\">Грешка на порталу. Фактура је окачена на СЕФ али статус налога није промењен у Фактурисан.</div>"
				});
			}
		}else{
			res.render("message",{
				pageTitle: "Грешка",
				user: req.session.user,
				message: "<div class=\"text\">Ваш налог није овлашћен да види ову страницу.</div>"
			});
		}
	}else{
		res.redirect("/login");	
	}
});

server.get('/uspesnoFakturisano',async (req,res)=>{
	if(req.session.user){
		if(Number(req.session.user.role)==40){
			res.render("message",{
				pageTitle: "Успешно фактурисано",
				user: req.session.user,
				message: "<div class=\"text\">Успешно фактурисан налог.</div>"
			});
		}else{
			res.render("message",{
				pageTitle: "Грешка",
				user: req.session.user,
				message: "<div class=\"text\">Ваш налог није овлашћен да види ову страницу.</div>"
			});
		}
	}else{
		res.redirect("/login?url="+encodeURIComponent(req.url));
	}
});

server.get('/trecaLica',async (req,res)=>{
	if(req.session.user){
		if(Number(req.session.user.role)==10){
			try{
				var trecaLica = await trecaLicaDB.find({}).toArray();
				res.render("trecaLica/home",{
					pageTitle: "Трећа лица",
					user: req.session.user,
					trecaLica: trecaLica
				})
			}catch(err){
				logError(err);
				res.render("message",{
					pageTitle: "Програмска грешка",
					user: req.session.user,
					message: "<div class=\"text\">Дошло је до грешке у бази податка 103481.</div>"
				})
			}
		}else{
			res.render("message",{
				pageTitle: "Грешка",
				user: req.session.user,
				message: "<div class=\"text\">Ваш налог није овлашћен да види ову страницу.</div>"
			});
		}
	}else{
		res.redirect("/login?url="+encodeURIComponent(req.url));
	}
})

server.get('/trecaLica/new',async (req,res)=>{
	if(req.session.user){
		if(Number(req.session.user.role)==10){
			try{
				var trecaLica = await trecaLicaDB.find({}).toArray()
				res.render("trecaLica/kreiranje",{
					pageTitle: "Креирање трећег лица",
					trecaLica: trecaLica,
					user: req.session.user
				})
			}catch(err){
				logError(err);
				res.render("message",{
					pageTitle: "Програмска грешка",
					user: req.session.user,
					message: "<div class=\"text\">Дошло је до грешке у бази податка 10384.</div>"
				})
			}
		}else{
			res.render("message",{
				pageTitle: "Грешка",
				user: req.session.user,
				message: "<div class=\"text\">Ваш налог није овлашћен да види ову страницу.</div>"
			});
		}
	}else{
		res.redirect("/login?url="+encodeURIComponent(req.url));
	}
})

server.post('/novoTreceLice', async (req, res)=> {
	if(req.session.user){
		if(Number(req.session.user.role)==10){
			try{
				var json = JSON.parse(req.body.json);
				var cenovnik = JSON.parse(JSON.stringify(json.cenovnik));
				delete json.cenovnik;
				json.uniqueId = generateId(7)+"--"+new Date().getTime();

				await trecaLicaDB.insertOne(json);
				var cenovnikJson = {};
				cenovnikJson.uniqueId = json.uniqueId;
				cenovnikJson.cenovnik = cenovnik;
				await cenovniciTrecihLicaDB.insertOne(cenovnikJson);
				res.render("message",{
					pageTitle: "Успешно додато",
					user: req.session.user,
					message: "<div class=\"text\">Треће лице "+јson.naziv+" успешно додато.</div>"
				});
			}catch(err){
				logError(err);
				res.render("message",{
					pageTitle: "Програмска грешка",
					user: req.session.user,
					message: "<div class=\"text\">Дошло је до грешке у бази податка 10409.</div>"
				})
			}


			
		}else{
			res.render("message",{
				pageTitle: "Грешка",
				user: req.session.user,
				message: "<div class=\"text\">Ваш налог није овлашћен да види ову страницу.</div>"
			});
		}
	}else{
		res.redirect("/login");	
	}
});



server.get('/trecaLica/noviNalog',async (req,res)=>{
	if(req.session.user){
		if(Number(req.session.user.role)==10){
			try{
				var trecaLica = await trecaLicaDB.find({}).toArray();
				res.render("trecaLica/noviNalog",{
					pageTitle: "Креирање трећег лица",
					trecaLica: trecaLica,
					user: req.session.user
				})
			}catch(err){
				logError(err);
				res.render("message",{
					pageTitle: "Програмска грешка",
					user: req.session.user,
					message: "<div class=\"text\">Дошло је до грешке у бази податка 10384.</div>"
				})
			}
		}else{
			res.render("message",{
				pageTitle: "Грешка",
				user: req.session.user,
				message: "<div class=\"text\">Ваш налог није овлашћен да види ову страницу.</div>"
			});
		}
	}else{
		res.redirect("/login?url="+encodeURIComponent(req.url));
	}
})

server.get('/trecaLica/:uniqueId',async (req,res)=>{
	if(req.session.user){
		if(Number(req.session.user.role)==10){
			try{
				var trecaLica = await trecaLicaDB.find({uniqueId:req.params.uniqueId}).toArray();

				if(trecaLica.length>0){
					var cenovnik = await cenovniciTrecihLicaDB.find({uniqueId:req.params.uniqueId}).toArray();
					var treceLice = trecaLica[0];
					treceLice.cenovnik = cenovnik[0].cenovnik;
					var nalozi = await naloziTrecihLicaDB.find({treceLice:req.params.uniqueId}).toArray();
					res.render("trecaLica/administracija",{
						pageTitle: "Администрација трећег лица",
						treceLice: treceLice,
						nalozi: nalozi,
						user: req.session.user
					})
				}else{
					res.render("message",{
						pageTitle: "Грешка",
						user: req.session.user,
						message: "<div class=\"text\">Непостојеће треће лице.</div>"
					})
				}
			}catch(err){
				logError(err);
				res.render("message",{
					pageTitle: "Програмска грешка",
					user: req.session.user,
					message: "<div class=\"text\">Дошло је до грешке у бази податка 10384.</div>"
				})
			}
		}else{
			res.render("message",{
				pageTitle: "Грешка",
				user: req.session.user,
				message: "<div class=\"text\">Ваш налог није овлашћен да види ову страницу.</div>"
			});
		}
	}else{
		res.redirect("/login?url="+encodeURIComponent(req.url));
	}
})

server.post('/noviNalogTrecihLica', async (req, res)=> {
	if(req.session.user){
		if(Number(req.session.user.role)==10){
			try{
				var json = JSON.parse(req.body.json);
				json.uniqueId = generateId(7)+"--"+new Date().getTime();

				var nalozi = await naloziTrecihLicaDB.find({}).toArray();
				json.broj = eval(nalozi.length+1).toString().padStart(7,"0");
				json.kreirao = req.session.user;
				json.datum = {};
				json.datum.datetime = new Date().getTime();
				json.datum.datum = getDateAsStringForDisplay(new Date());
				json.obracun = [];
				json.statusNaloga = "Primljen";
				json.ukupanIznos = 0;

				await naloziTrecihLicaDB.insertOne(json);

				res.redirect("/trecaLica/nalog/"+json.uniqueId);
			}catch(err){
				logError(err);
				res.render("message",{
					pageTitle: "Програмска грешка",
					user: req.session.user,
					message: "<div class=\"text\">Дошло је до грешке у бази податка 10409.</div>"
				})
			}


			
		}else{
			res.render("message",{
				pageTitle: "Грешка",
				user: req.session.user,
				message: "<div class=\"text\">Ваш налог није овлашћен да види ову страницу.</div>"
			});
		}
	}else{
		res.redirect("/login");	
	}
});

server.get('/trecaLica/nalog/:uniqueId',async (req,res)=>{
	if(req.session.user){
		if(Number(req.session.user.role)==10){
			try{
				var nalozi = await naloziTrecihLicaDB.find({uniqueId:req.params.uniqueId}).toArray();

				if(nalozi.length>0){
					var nalog = nalozi[0];
					var trecaLica = await trecaLicaDB.find({uniqueId:nalozi[0].treceLice}).toArray();
					var treceLice = trecaLica[0];
					var cenovnik = await cenovniciTrecihLicaDB.find({uniqueId:nalozi[0].treceLice}).toArray();
					treceLice.cenovnik = cenovnik[0].cenovnik;
					var izvestaji = await izvestajiTrecihLicaDB.find({nalogId:req.params.uniqueId}).toArray();
					res.render("trecaLica/nalog",{
						pageTitle: "Налог број "+nalozi[0].broj,
						treceLice: treceLice,
						nalog: nalog,
						izvestaji: izvestaji,
						phoneAccessCode: phoneAccessCode,
						user: req.session.user
					})
				}else{
					res.render("message",{
						pageTitle: "Грешка",
						user: req.session.user,
						message: "<div class=\"text\">Непостојећи налог.</div>"
					})
				}
			}catch(err){
				logError(err);
				res.render("message",{
					pageTitle: "Програмска грешка",
					user: req.session.user,
					message: "<div class=\"text\">Дошло је до грешке у бази податка 10384.</div>"
				})
			}
		}else{
			res.render("message",{
				pageTitle: "Грешка",
				user: req.session.user,
				message: "<div class=\"text\">Ваш налог није овлашћен да види ову страницу.</div>"
			});
		}
	}else{
		res.redirect("/login?url="+encodeURIComponent(req.url));
	}
});

server.post('/edit-nalog-treca-lica', async (req, res)=> {
	if(req.session.user){
		if(Number(req.session.user.role)==10){
				uploadSlika(req, res, async function (error) {
				    if (error) {
				      logError(error);
				      return res.render("message",{pageTitle: "Грешка",message: "<div class=\"text\">Дошло је до грешке приликом качења слика.</div>",user: req.session.user});
				    }
				    var nalogJson = JSON.parse(req.body.json);
				    //console.log(nalogJson);
				    var izvestajJson = {};
				    izvestajJson.uniqueId 	=	new Date().getTime() +"--"+generateId(5);
				    izvestajJson.nalog		=	nalogJson.broj;
				    izvestajJson.nalogId	=	nalogJson.id;
				    izvestajJson.datetime 	=	new Date().getTime();
				    izvestajJson.datum		=	getDateAsStringForDisplay(new Date(Number(izvestajJson.datetime)));
				    izvestajJson.izvestaj	=	nalogJson.izvestaj;
				    izvestajJson.user 		=	req.session.user;
				    izvestajJson.photos		=	[];
				    for(var i=0;i<req.files.length;i++){
				    	izvestajJson.photos.push(req.files[i].transforms[0].location)
				    }
				    try{
				    	if(izvestajJson.izvestaj!="" || izvestajJson.photos.length>0){
								//ima izvestaja
								await  izvestajiTrecihLicaDB.insertOne(izvestajJson);
							}
				    	if( nalogJson.status==nalogJson.stariNalog.statusNaloga  && JSON.stringify(nalogJson.obracun)==JSON.stringify(nalogJson.stariNalog.obracun)){
								//nema izmena na nalogu
							}else{
								//ima izmena na nalogu
								var setObj	=	{ $set: {
									statusNaloga: nalogJson.status,
									obracun: nalogJson.obracun,
									ukupanIznos: nalogJson.ukupanIznos,
									izmenio: req.session.user
								}};
								await naloziTrecihLicaDB.updateOne({uniqueId:nalogJson.id},setObj);
							}
							res.redirect("/trecaLica/nalog/"+nalogJson.id);
				    }catch(err){
				    	logError(err);
							res.render("message",{
								pageTitle: "Програмска грешка",
								user:req.session.user,
								message: "<div class=\"text\">Дошло је до грешке у бази податка 10642.</div>"
							});
				    }
					
				});
			
		}else{
			res.send("Nije definisan nivo korisnika");
		}
	}else{
		res.redirect("/login");
	}
});

/*server.get('/portalStambenoNalozi', async (req, res)=> {
	var nalogJSON = {};
	nalogJSON.datetime = new Date().getTime();
	nalogJSON.date = new Date().getFullYear()+"."+eval(new Date().getMonth()+1)+"."+new Date().getDate();
	nalogJSON.reqBody = req.body;
	nalogJSON.reqHeader = req.headers;
	nalogJSON.source = "GET";
	if(stambenoDB){
		stambenoDB.insertOne(nalogJSON)
		.then((dbResponse)=>{
			res.status(200);
			res.send("Ok");
		}).catch((err)=>{
			logError(err)
			res.status(500);
			res.send("Database error");
		})	
	}
});*/


server.post('/portalStambenoNalozi', async (req, res)=> {
	var timestamp = Date.now();
	var nalogJSON = {};
	nalogJSON.datetime = timestamp;
	nalogJSON.date = getDateAsStringForDisplay(new Date());
	nalogJSON.reqBody = req.body;
	nalogJSON.reqHeader = req.headers;
	nalogJSON.source = "POST";

	if(nalogJSON.reqBody.hasOwnProperty("note_details")){
		try{
			var note = nalogJSON.reqBody.note_details[0];
			
			var izvestajJson = {
				uniqueId: generateId(5) + "--" + timestamp,
				nalog: note.broj_naloga.toString(),
				datetime: timestamp,
				datum: getDateAsStringForDisplay(new Date()),
				izvestaj: note.tekst_beleske,
				photos: [],
				user: {
					email: note.kreirao_belesku,
					name: "PORTAL STAMBENO <sub>"+note.kreirao_belesku+"</sub>"
				}
			};

			
			await stambenoDB.insertOne(nalogJSON);
			var nalozi = await naloziDB.find({broj:nalogJSON.reqBody.note_details[0].broj_naloga.toString()}).toArray();
			if(nalozi.length==0){
				var nalozi = await nalozi2024DB.find({broj:nalogJSON.reqBody.note_details[0].broj_naloga.toString()}).toArray();
				if(nalozi.length==0){
					var nalozi = await client.db("Hausmajstor").collection('Nalozi').find({broj:nalogJSON.reqBody.note_details[0].broj_naloga.toString()}).toArray();
					await client.db("Hausmajstor").collection('Izvestaji').insertOne(izvestajJson);
				}else{
					await izvestajiDB.insertOne(izvestajJson);
					if (note.kreirao_belesku.toLowerCase().includes("stambeno")) {
						var nalog = nalozi[0];
						io.emit(
							"notification",
							"noviKomentar",
							"<div class=\"title\">KOMENTAR STAMBENOG</div>"+
							 "<div class=\"text\">"+
							  "<a href=\"/nalog/"+nalog.broj+"\" target=\"blank\">"+nalog.broj+"</a> -"+ 
							  "<span class=\"adresa\">"+nalog.adresa+"</span> - "+
							  "<span class=\"radnaJedinica\">"+nalog.radnaJedinica+"</span>"+
							 "</div>",
							nalog.radnaJedinica
						);
					}
				}
				
			}else{
				await izvestajiDB.insertOne(izvestajJson);
				if (note.kreirao_belesku.toLowerCase().includes("stambeno")) {
					var nalog = nalozi[0];
					io.emit(
						"notification",
						"noviKomentar",
						"<div class=\"title\">KOMENTAR STAMBENOG</div>"+
						 "<div class=\"text\">"+
						  "<a href=\"/nalog/"+nalog.broj+"\" target=\"blank\">"+nalog.broj+"</a> -"+ 
						  "<span class=\"adresa\">"+nalog.adresa+"</span> - "+
						  "<span class=\"radnaJedinica\">"+nalog.radnaJedinica+"</span>"+
						 "</div>",
						nalog.radnaJedinica
					);
				}
			}

			

			res.status(200).json({
				code: "200",
				message: "Primio sam podatke za belesku.",
				warnings: {
					vrsta_promene: "Missing type of change",
					broj_ugovora: "Contract number is missing"
				}
			});

			
		}catch(err){
			logError(err);
			res.status(501).json({
				code: "501",
				message: "Neuspesan prijem beleske"
			});
		}
	}else if(nalogJSON.reqBody.hasOwnProperty("order_headers")){
		try{
			var stambenoJson = JSON.parse(JSON.stringify(nalogJSON.reqBody.order_headers[0]));
			var nalozi = await naloziDB.find({broj:stambenoJson.broj_naloga.toString()}).toArray();
			if(nalozi.length==0){
				nalozi = await nalozi2024DB.find({broj:stambenoJson.broj_naloga.toString()}).toArray();
			}
			var hausMajstorNalozi = await client.db("Hausmajstor").collection('Nalozi').find({broj:stambenoJson.broj_naloga.toString()}).toArray();
			var nalogHausMajstora = 0;
			for(var i=0;i<hausMajstorNalozi.length;i++){
				nalozi.push(hausMajstorNalozi[i]);
				nalogHausMajstora = 1;
			}
			if(nalozi.length==0){
				//NOVI NALOG
				var nalogJson	=	{
					uniqueId: generateId(15) +"--"+ timestamp,
					digitalizacija: {
						datetime: timestamp,
						datum: getDateAsStringForDisplay(new Date()),
						stambeno: {
							datum: stambenoJson.datum_izdavanja_naloga.split("T")[0],
							vreme: stambenoJson.vreme_naloga,
							brojZahteva: stambenoJson.broj_zahteva,
							tipNaloga: stambenoJson.tip_naloga,
							partija: stambenoJson.party_name,
							vik: stambenoJson.partija,
							nadzor: stambenoJson.dodeljen,
							email: stambenoJson.email,
							originalniNadzor: stambenoJson.originalni_nadzor,
							primarniNadzor: stambenoJson.primarni_nadzor,
							rok: stambenoJson.inicijalni_rok
						},
						korisnik: {
							ime: "PORTAL STAMBENO",
							id: "info@stambeno.com"
						},
						lokacija: ""
					},
					broj: stambenoJson.broj_naloga.toString(),
					punaAdresa: stambenoJson.stambena_zajednica,
					adresa: stambenoJson.stambena_zajednica.split(",")[0],
					opis: stambenoJson.opis,
					vrstaRada: stambenoJson.tip_naloga,
					radnaJedinica: stambenoJson.radna_jedinica,
					datum:{
						punDatum: new Date(),
						datum: getDateAsStringForDisplay(new Date()),
						datetime: timestamp
					},
					zahtevalac: stambenoJson.zahtevalac,
					dispecer: "",
					obracun:[],
					ukupanIznos: 0,
					ukupanIznosPodizvodjaca: 0,
					kategorijeRadova: [],
					statusNaloga: "Primljen",
					majstor: "",
					faktura:{
						pdv:"35",
						broj:"",
						penal:0,
						samoBroj:0,
						premijus:{},
						pg:{},
						podizvodjac:{},
						datum:{
							datetime: 0,
							datum: ""
						}
					},
					prijemnica:{
						broj: "",
						validanObracun: false,//true ako se parsePrijemnice pokaze da radi posao
						iznosSaCenovnika: 0,
						datum:{
							datetime: 0,
							datum: ""
						},
						lokacija: ""
					}
				}

				var geoCodeHeader = {
				    'accept': 'text/plain',
				    'Content-Type': 'application/json'
				};

				var geoCodeOptions = {
				    url: 'https://maps.googleapis.com/maps/api/geocode/json?address='+encodeURIComponent(nalogJson.adresa + ', Beograd')+'&key='+process.env.googlegeocoding,
				    method: 'GET',
				    headers: geoCodeHeader
				};
				nalogJson.coordinates = {};
				if(nalogJson.vrstaRada!="HAUSMAJSTOR"){
					io.emit("notification","noviNalog","<div class=\"title\">NOVI NALOG</div><div class=\"text\"><a href=\"/nalog/"+nalogJson.broj+"\" target=\"blank\">"+nalogJson.broj+"</a> - <span class=\"adresa\">"+nalogJson.adresa+"</span> - <span class=\"radnaJedinica\">"+nalogJson.radnaJedinica+"</span></span></div>",nalogJson.radnaJedinica)
				}else{
					//POSALJI MAIL DA IMA NOVI NALOG
					var mailOptions = {
						from: '"Portal HitnoApp" <admin@hitnoapp.rs>',
						to: "vladeta.stamenkovic@poslovigrada.rs",
						subject: 'Novi nalog za Hausmajstora '+nalogJson.broj,
						html: 'Otvoren je novi nalog za hausmajstora <a href="https://portal.hitnoapp.rs/nalog/'+nalogJson.broj+'">'+nalogJson.broj+'</a>.<br><b>Opis:</b><br>'+nalogJson.opis+'<br>'+mailPotpis
					};
						
					transporter.sendMail(mailOptions, (error, info) => {
						if (error) {
							logError(error);
						}
					});
				}

				const config = {
            url: 'https://maps.googleapis.com/maps/api/geocode/json?address='+encodeURIComponent(nalogJson.adresa + ', Beograd')+'&key='+process.env.googlegeocoding,
            method: 'GET', // If necessary
            headers: { 
                'accept': 'text/plain',
				    		'Content-Type': 'application/json'
            }
        };

        var response = await axios(config);
        var json = response.data;
				nalogJson.coordinates = {}; 
				if(json.hasOwnProperty("results")){
					if(json.results.length>0){
						if(json.results[0].hasOwnProperty("geometry")){
							nalogJson.coordinates = json.results[0].geometry.location; 
						}
					}
				}

				var websiteConfig = {
			    url: 'https://poslovigrada.rs/nalog',
			    method: 'POST',
			    headers: websiteHeader,
			    data: JSON.stringify({datum: nalogJson.digitalizacija.datum,vreme: new Date().getHours().toString().padStart(2,"0")+":"+new Date().getMinutes().toString().padStart(2,"0"),radnaJedinica: nalogJson.radnaJedinica, adresa: nalogJson.adresa})
				};
				var response = await axios(websiteConfig);
				
				if(nalogJson.vrstaRada!="HAUSMAJSTOR"){
					await naloziDB.insertOne(nalogJson)
				}else{
					await client.db("Hausmajstor").collection('Nalozi').insertOne(nalogJson)
				}
				res.status(200).json({
					code: "200",
					message: "Primio sam podatke za nalog.",
					warnings: {
						vrsta_promene: "Missing type of change",
						broj_ugovora: "Contract number is missing"
					}
				});

			}else{
				//POSTOJECI NALOG, nalogHausMajstora==1 znaci hausmajstor
				await portalStambenoTestDB.insertOne(stambenoJson)

				res.status(200).json({
					code: "200",
					message: "Primio sam podatke za nalog.",
					warnings: {
						vrsta_promene: "Missing type of change",
						broj_ugovora: "Contract number is missing"
					}
				});

				var nalog = nalozi[0];
				if(nalog.statusNaloga!="Fakturisan" && nalogHausMajstora==0){
					//PROMENE ZA NALOGE KOJI NISU OD HAUSMAJSTORA
					if(stambenoJson.vrsta_promene=="STATUS" && stambenoJson.status_code=="NA_ODOBRENJU"){
						var obracun = [];
						for(var i=0;i<stambenoJson.order_lines.length;i++){
							var json = {};
							json.code = stambenoJson.order_lines[i].sifra_artikla;
							json.quantity = stambenoJson.order_lines[i].kolicina_dobavljaca;
							obracun.push(json);
						}
						var ukupanIznos = 0;
						for(var i=0;i<obracun.length;i++){
							for(var j=0;j<cenovnik.length;j++){
								if(obracun[i].code==cenovnik[j].code){
									ukupanIznos = ukupanIznos + cenovnik[j].price*obracun[i].quantity;
									break;
								}
							}
						}
						var setObj	=	{ $set: {
							obracun: obracun,
							statusNaloga: "Nalog u Stambenom",
							ukupanIznos: ukupanIznos
						}};
						var nalozi2024 = await nalozi2024DB.find({uniqueId:nalog.uniqueId}).toArray();
						if(nalozi2024.length>0){
							await nalozi2024DB.updateOne({uniqueId:nalog.uniqueId},setObj);
						}else{
							await naloziDB.updateOne({uniqueId:nalog.uniqueId},setObj);
						}
						
					}else if(stambenoJson.vrsta_promene=="STATUS" && stambenoJson.status_code=="IZVRSEN"){
						var setObj	=	{ $set: {
							statusNaloga: "Završeno"
						}};
						var nalozi2024 = await nalozi2024DB.find({uniqueId:nalog.uniqueId}).toArray();
						if(nalozi2024.length>0){
							await nalozi2024DB.updateOne({uniqueId:nalog.uniqueId},setObj);
						}else{
							await naloziDB.updateOne({uniqueId:nalog.uniqueId},setObj);
						}

					}else if(stambenoJson.vrsta_promene=="STATUS" && stambenoJson.status_code=="VRACEN"){
						var podizvodjac = podizvodjaci.indexOf(nalozi[0].majstor)>=0 ? "ПОДИЗВОЂАЧА" : "";
						var setObj	=	{ $set: {
							statusNaloga: "Vraćen"
						}};
						var nalozi2024 = await nalozi2024DB.find({uniqueId:nalog.uniqueId}).toArray();
						if(nalozi2024.length>0){
							await nalozi2024DB.updateOne({uniqueId:nalog.uniqueId},setObj);
						}else{
							await naloziDB.updateOne({uniqueId:nalog.uniqueId},setObj);
						}

						var mailTo = podizvodjaci.indexOf(nalozi[0].majstor)>=0 ? "marija.slijepcevic@poslovigrada.rs,milica.radun@poslovigrada.rs" : "marija.slijepcevic@poslovigrada.rs";
						var mailOptions = {
							from: '"ВиК Портал Послова Града" <admin@poslovigrada.rs>',
							to: mailTo,
							subject: 'Налог број '+podizvodjac+' '+nalog.broj+' је враћен',
							html: 'Поштовани/а,<br>Налог '+podizvodjac+' <a href=\"https://vik2024.poslovigrada.rs/nalog/'+nalog.broj+'\">'+nalog.broj+'</a> је враћен.<br> Радна Јединица: '+nalog.radnaJedinica+'<br>Adresa: '+nalog.adresa+'.'
						};

						transporter.sendMail(mailOptions, (error, info) => {
							if (error) {
								logError(error);
							}
						});

					}else if(stambenoJson.vrsta_promene=="STATUS" && stambenoJson.status_code=="OTKAZAN"){
						var setObj	=	{ $set: {
							statusNaloga: "Storniran"
						}};
						var nalozi2024 = await nalozi2024DB.find({uniqueId:nalog.uniqueId}).toArray();
						if(nalozi2024.length>0){
							await nalozi2024DB.updateOne({uniqueId:nalog.uniqueId},setObj);
						}else{
							await naloziDB.updateOne({uniqueId:nalog.uniqueId},setObj);
						}
						var mailOptions = {
							from: '"ВиК Портал Послова Града" <admin@poslovigrada.rs>',
							to: 'marija.slijepcevic@poslovigrada.rs',
							subject: 'Налог број '+nalog.broj+' је сторниран',
							html: 'Поштовани/а,<br>Налог <a href=\"https://vik2024.poslovigrada.rs/nalog/'+nalog.broj+'\">'+nalog.broj+'</a> је сторниран.<br> Радна Јединица: '+nalog.radnaJedinica+'<br>Adresa: '+nalog.adresa+'.'
						};

						transporter.sendMail(mailOptions, (error, info) => {
							if (error) {
								logError(error);
							}
						});
					}
				}else if(nalog.statusNaloga!="Fakturisan" && nalogHausMajstora==1){
					//Hausmajstorski nalog koji vec postoji
					if(stambenoJson.vrsta_promene=="STATUS" && stambenoJson.status_code=="NA_ODOBRENJU"){
						var obracun = [];
						for(var i=0;i<stambenoJson.order_lines.length;i++){
							var json = {};
							json.code = stambenoJson.order_lines[i].sifra_artikla;
							json.quantity = stambenoJson.order_lines[i].kolicina_dobavljaca;
							obracun.push(json);
						}
						var ukupanIznos = 0;
						for(var i=0;i<obracun.length;i++){
							for(var j=0;j<cenovnik.length;j++){
								if(obracun[i].code==cenovnik[j].code){
									ukupanIznos = ukupanIznos + cenovnik[j].price*obracun[i].quantity;
									break;
								}
							}
						}
						var setObj	=	{ $set: {
							obracun: obracun,
							statusNaloga: "Nalog u Stambenom",
							ukupanIznos: ukupanIznos
						}};
						await client.db("Hausmajstor").collection('Nalozi').updateOne({uniqueId:nalog.uniqueId},setObj);
					}else if(stambenoJson.vrsta_promene=="STATUS" && stambenoJson.status_code=="IZVRSEN"){
						var setObj	=	{ $set: {
							statusNaloga: "Završeno"
						}};
						await client.db("Hausmajstor").collection('Nalozi').updateOne({uniqueId:nalog.uniqueId},setObj);
					}else if(stambenoJson.vrsta_promene=="STATUS" && stambenoJson.status_code=="VRACEN"){
						var podizvodjac = podizvodjaci.indexOf(nalozi[0].majstor)>=0 ? "ПОДИЗВОЂАЧА" : "";
						var setObj	=	{ $set: {
							statusNaloga: "Vraćen"
						}};
						await client.db("Hausmajstor").collection('Nalozi').updateOne({uniqueId:nalog.uniqueId},setObj);

						var mailTo = podizvodjaci.indexOf(nalozi[0].majstor)>=0 ? "milica.radun@poslovigrada.rs,vladeta.stamenkovic@poslovigrada.rs" : "milica.radun@poslovigrada.rs,vladeta.stamenkovic@poslovigrada.rs";
						var mailOptions = {
							from: '"Portal HitnoApp" <admin@hitnoapp.rs>',
							to: mailTo,
							subject: 'Nalog '+podizvodjac+' '+nalog.broj+' je vracen',
							html: 'Zdravo,<br>Nalog '+podizvodjac+' <a href=\"https://portal.hitnoapp.rs/nalog/'+nalog.broj+'\">'+nalog.broj+'</a> je vraćen.<br> Radna jedinica: '+nalog.radnaJedinica+'<br>Adresa: '+nalog.adresa+'.'
						};

						transporter.sendMail(mailOptions, (error, info) => {
							if (error) {
								logError(error);
							}
						});

					}else if(stambenoJson.vrsta_promene=="STATUS" && stambenoJson.status_code=="OTKAZAN"){
						var setObj	=	{ $set: {
							statusNaloga: "Storniran"
						}};
						await client.db("Hausmajstor").collection('Nalozi').updateOne({uniqueId:nalog.uniqueId},setObj)
						var mailOptions = {
							from: '"Portal HitnoApp" <admin@hitnoapp.rs>',
							to: 'milica.radun@poslovigrada.rs,vladeta.stamenkovic@poslovigrada.rs',
							subject: 'Nalog broj '+nalog.broj+' je storniran',
							html: 'Zdravo,<br>Nalog <a href=\"https://portal.hitnoapp.rs/nalog/'+nalog.broj+'\">'+nalog.broj+'</a> je storniran.<br> Radna Jedinica: '+nalog.radnaJedinica+'<br>Adresa: '+nalog.adresa+'.'
						};

						transporter.sendMail(mailOptions, (error, info) => {
							if (error) {
								logError(error);
							}
						});
					}
				}
			}

		}catch(err){
			logError(err);
			res.status(501).json({
				code: "501",
				message: "Neuspesan prijem naloga"
			});
		}
		
	}else{
			stambeno2DB.insertOne(nalogJSON)
			.then((dbResponse)=>{
				res.status(200);
				res.setHeader('Content-Type', 'application/json');
				var primerJson = {"code":"200","message":"Primio sam podatke za nalog ali ne znam koje.","warnings":{"vrsta_promene":"Missing type of change","broj_ugovora":"Contract number is missing"}}
				res.send(JSON.stringify(primerJson));
			}).catch((err)=>{
				logError(err)
				res.status(500);
				res.send("Database error");
			})	
		
	}
	
});

server.post('/portalStambenoUgovori', async (req, res)=> {
	var nalogJSON = {};
	nalogJSON.datetime = new Date().getTime();
	nalogJSON.date = new Date().getFullYear()+"."+eval(new Date().getMonth()+1)+"."+new Date().getDate();
	nalogJSON.reqBody = req.body;
	nalogJSON.reqHeader = req.headers;
	nalogJSON.source = "POST";
	if(stambenoDB){
		stambenoDB.insertOne(nalogJSON)
		.then((dbResponse)=>{
			res.status(200);
			res.setHeader('Content-Type', 'application/json');
			var primerJson = {"code":"200","message":"Primio sam podatke za ugovor.","warnings":{"vrsta_promene":"Missing type of change","broj_ugovora":"Contract number is missing"}}
			res.send(JSON.stringify(primerJson));
		}).catch((err)=>{
			logError(err)
			res.status(500);
			res.send("Database error");
		})	
	}
});

server.get('/tv2', async (req, res)=> {
  naloziDB.find({statusNaloga:{$nin:["Završeno","Nalog u Stambenom","Spreman za fakturisanje","Fakturisan","Storniran"]}}).toArray()
  .then((nalozi)=>{
      var naloziToSend = [];
      for(var i=0;i<nalozi.length;i++){
      	var nalogToPush = {};
      	nalogToPush.coordinates = nalozi[i].coordinates;
      	nalogToPush.broj = nalozi[i].broj;
      	nalogToPush.radnaJedinica = nalozi[i].radnaJedinica;
      	nalogToPush.statusNaloga = nalozi[i].statusNaloga;
        naloziToSend.push(nalogToPush);
      }
      majstoriDB.find({}).toArray()
      .then((majstori)=>{
          res.render("tv2",{
              majstori: majstori,
              nalozi: naloziToSend,
              pageTitle: "Мапа"
          })
      })
      .catch((error)=>{
          logError(error);
          res.render("message",{
              pageTitle: "Грешка",
              user: req.session.user,
              message: "<div class=\"text\">Грешка у бази података 5870.</div>"
          });
      });
  })
  .catch((error)=>{
      logError(error);
      res.render("message",{
          pageTitle: "Грешка",
          user: req.session.user,
          message: "<div class=\"text\">Грешка у бази података 5871.</div>"
      });
  });
});

server.get('/heatmap', async (req, res)=> {
	var meseci = [];
	for(var i=2024;i<=2024;i++){
		for(var j=1;j<=12;j++){
			var json = {};
			json.mesec = j.toString().padStart(2,"0")+"."+i.toString();
			json.mesecBroj = j;
			json.godinaBroj = i;
			json.nalozi = [];
			meseci.push(json)
		}
	}


	naloziDB.find({}).toArray()
	.then((nalozi)=>{
		for(var i=0;i<meseci.length;i++){
			for(var j=0;j<nalozi.length;j++){
				if(nalozi[j].datum.datum.includes(meseci[i].mesec)){
					meseci[i].nalozi.push(nalozi[j])
				}
			}
		}
		
		var woma = ["80.02.09.020","80.02.09.021","80.02.09.022"];
		var rucno = ["80.02.09.001","80.02.09.002","80.02.09.003","80.02.09.004","80.02.09.005"];
		var crp = ["80.02.09.009","80.02.09.010","80.02.09.012","80.02.09.025"];
		var kop = ["80.03.01.001","80.03.01.002","80.03.01.003","80.03.01.025"];
		var mas = ["80.03.01.019","80.03.01.020"];
		var kup = ["80.01.05.057","80.01.05.058","80.01.05.059","80.01.05.060","80.01.05.061","80.01.05.062","80.01.05.063","80.01.05.064"];

		for(var i=0;i<meseci.length;i++){			
			for(var j=0;j<meseci[i].nalozi.length;j++){
				meseci[i].nalozi[j].tipNaloga = "ZAMENA";
				var kategorisan = false;
				for(var k=0;k<meseci[i].nalozi[j].obracun.length;k++){
					if(mas.indexOf(meseci[i].nalozi[j].obracun[k].code)>=0){
						meseci[i].nalozi[j].tipNaloga = "BAGER";
						kategorisan = true;
						break;
					}
				}

				if(!kategorisan){
					for(var k=0;k<meseci[i].nalozi[j].obracun.length;k++){
						if(kop.indexOf(meseci[i].nalozi[j].obracun[k].code)>=0){
							meseci[i].nalozi[j].tipNaloga = "KOPANJE";
							kategorisan = true;
							break;
						}
					}	
				}

				if(!kategorisan){
					for(var k=0;k<meseci[i].nalozi[j].obracun.length;k++){
						if(woma.indexOf(meseci[i].nalozi[j].obracun[k].code)>=0){
							meseci[i].nalozi[j].tipNaloga = "WOMA";
							kategorisan = true;
							break;
						}
					}
				}

				if(!kategorisan){
					for(var k=0;k<meseci[i].nalozi[j].obracun.length;k++){
						if(rucno.indexOf(meseci[i].nalozi[j].obracun[k].code)>=0){
							if(parseFloat(meseci[i].nalozi[j].ukupanIznos)<20000){
								meseci[i].nalozi[j].tipNaloga = "SAJLA";
								kategorisan = true;
								break;
							}
						}
					}
				}

				if(!kategorisan){
					for(var k=0;k<meseci[i].nalozi[j].obracun.length;k++){
						if(crp.indexOf(meseci[i].nalozi[j].obracun[k].code)>=0){
							if(parseFloat(meseci[i].nalozi[j].ukupanIznos)<10000){
								meseci[i].nalozi[j].tipNaloga = "CRPLJENJE";
								kategorisan = true;
								break;
							}
						}
					}
				}

				if(!kategorisan){
					for(var k=0;k<meseci[i].nalozi[j].obracun.length;k++){
						if(kup.indexOf(meseci[i].nalozi[j].obracun[k].code)>=0){
							if(parseFloat(meseci[i].nalozi[j].ukupanIznos)<5500){
								meseci[i].nalozi[j].tipNaloga = "SPOJKA";
								kategorisan = true;
								break;
							}
						}
					}
				}

				if(!kategorisan){
					for(var k=0;k<meseci[i].nalozi[j].obracun.length;k++){
						if(kup.indexOf(meseci[i].nalozi[j].obracun[k].code)>=0){
							if(parseFloat(meseci[i].nalozi[j].ukupanIznos)<5500){
								meseci[i].nalozi[j].tipNaloga = "SPOJKA";
								kategorisan = true;
								break;
							}
						}
					}
				}

				if(!kategorisan){
					if(meseci[i].nalozi[j].obracun.length<=2){
						if(meseci[i].nalozi[j].obracun[0].code=="80.04.01.002" && meseci[i].nalozi[j].obracun[1].code=="80.04.01.005"){
							meseci[i].nalozi[j].tipNaloga = "LOKALNO";
							kategorisan = true;
							break;
						}else if(meseci[i].nalozi[j].obracun[0].code=="80.04.01.005" && meseci[i].nalozi[j].obracun[1].code=="80.04.01.002"){
							meseci[i].nalozi[j].tipNaloga = "LOKALNO";
							kategorisan = true;
							break;
						}else if(meseci[i].nalozi[j].obracun[0].code=="80.04.01.002" || meseci[i].nalozi[j].obracun[0].code=="80.04.01.005"){
							meseci[i].nalozi[j].tipNaloga = "LOKALNO";
							kategorisan = true;
							break;
						}
					}
				}






				/*for(var k=0;k<meseci[i].nalozi[j].obracun.length;k++){
					if(typeof meseci[i].nalozi[j].obracun[k]!== 'undefined'){
						if(woma.indexOf(meseci[i].nalozi[j].obracun[k].code)>=0){
							meseci[i].nalozi[j].tipNaloga = "WOMA";
							
							for(var l=0;l<meseci[i].nalozi[j].obracun.length;l++){
								if(kop.indexOf(meseci[i].nalozi[j].obracun[l].code)>=0){
									meseci[i].nalozi[j].tipNaloga = "KOPANJE";
									break;
								}
							}
							break;
						}
						if(rucno.indexOf(meseci[i].nalozi[j].obracun[k].code)>=0){
							meseci[i].nalozi[j].tipNaloga = "ODGUSENJE";
							if(parseFloat(meseci[i].nalozi[j].ukupanIznos)>20000){
								meseci[i].nalozi[j].tipNaloga = "ZAMENA";
							}
							break;
						}
						if(crp.indexOf(meseci[i].nalozi[j].obracun[k].code)>=0){
							meseci[i].nalozi[j].tipNaloga = "CRPLJENJE";
							if(parseFloat(meseci[i].nalozi[j].ukupanIznos)>10000){
								meseci[i].nalozi[j].tipNaloga = "ZAMENA";
							}
							break;
						}
						if(kop.indexOf(meseci[i].nalozi[j].obracun[k].code)>=0){
							meseci[i].nalozi[j].tipNaloga = "KOPANJE";
							break;
						}
						if(mas.indexOf(meseci[i].nalozi[j].obracun[k].code)>=0){
							meseci[i].nalozi[j].tipNaloga = "BAGER";
							break;
						}
						if(kup.indexOf(meseci[i].nalozi[j].obracun[k].code)>=0){
							meseci[i].nalozi[j].tipNaloga = "SPOJKA";
							if(parseFloat(meseci[i].nalozi[j].ukupanIznos)>5500){
								meseci[i].nalozi[j].tipNaloga = "ZAMENA";
							}
							break;
						}
					}
					
				}*/
			}
		}
		res.render("heatmap",{
			pageTitle: "Mapa",
			mapKey: process.env.googlegeocoding,
			meseci: meseci
		})
	})
	.catch((error)=>{
		console.log(error);
	})
})




server.get('/rasporedRadova', async(req,res)=>{
	var monday = getMonday(new Date());
	var dates = [];
	for(var i=0;i<7;i++){
		dates.push(monday.getFullYear()+"-"+eval(monday.getMonth()+1).toString().padStart(2,"0")+"-"+monday.getDate().toString().padStart(2,"0"));
		monday.setDate(monday.getDate()+1);
	}
	majstoriDB.find({}).toArray()
	.then((majstori)=>{
		dodeljivaniNaloziDB.find({datumRadova:{$in:dates}}).toArray()
		.then((dodele)=>{
			res.render("rasporedRadova",{
				pageTitle: "Недељни распоред радова",
				dodele: dodele,
				majstori: majstori,
				dates: dates
			});
		})
		.catch((error)=>{
			logError(error);
			res.send("Greska u bazi podataka");
		})
	})
	.catch((error)=>{
		logError(error);
		res.send("Greska");
	})	
});


server.get('/tv', async (req, res)=> {
	res.redirect('/mapaUzivo')
});


server.get('/juce', async (req, res)=> {
	var juce = new Date();
	juce.setDate(juce.getDate()-1);
	naloziDB.find({"datum.datum":getDateAsStringForDisplay(juce)}).toArray()
	.then((jucerasnjiNalozi)=>{
		var jucerasnjiBrojeviNaloga = [];
		for(var i=0;i<jucerasnjiNalozi.length;i++){
			jucerasnjiBrojeviNaloga.push(jucerasnjiNalozi[i].broj)
		}
		dodeljivaniNaloziDB.find({"datum.datum":getDateAsStringForDisplay(juce)}).toArray()
		.then((dodele)=>{
			for(var i=0;i<jucerasnjiNalozi.length;i++){
				jucerasnjiNalozi[i].dodele = [];
				for(var j=0;j<dodele.length;j++){
					dodele[j].dodeljen = false;
					if(jucerasnjiNalozi[i].broj==dodele[j].nalog){
						jucerasnjiNalozi[i].dodele.push(dodele[j]);
						dodele[j].dodeljen = true;
					}
				}
			}

			var dodeljeniBrojeviOdRanije = [];
			for(var i=0;i<dodele.length;i++){
				if(dodele[i].dodeljen==false){
					dodeljeniBrojeviOdRanije.push(dodele[i].nalog);
				}
			}
			naloziDB.find({broj:{$in:dodeljeniBrojeviOdRanije}}).toArray()
			.then((dodeljeniNaloziOdRanije)=>{
				for(var i=0;i<dodeljeniNaloziOdRanije.length;i++){
					dodeljeniNaloziOdRanije[i].dodele = [];
					for(var j=0;j<dodele.length;j++){
						if(dodele[j].nalog==dodeljeniNaloziOdRanije[i].broj){
							dodeljeniNaloziOdRanije[i].dodele.push(dodele[j])
						}
					}
				}
				majstoriDB.find({uniqueId:{$nin:podizvodjaci}}).toArray()
				.then((majstori)=>{
					res.render("statusJuce",{
						pageTitle: "Јучерашњи налози",
						jucerasnjiNalozi: jucerasnjiNalozi,
						dodeljeniNaloziOdRanije: dodeljeniNaloziOdRanije,
						majstori: majstori
					})
				})
				.catch((error)=>{
					logError(error)
					res.send("Greska 4")
				})
			})
			.catch((error)=>{
				logError(error);
				res.send("Greska 3")
			})
		})
		.catch((error)=>{
			logError(error);
			res.send("Greska 2")
		})
	})
	.catch((error)=>{
		logError(error)
		res.send("Greska 1");
	})
});

server.get('/prisustvo', async (req, res)=> {
	if(req.session.user){
		var date = new Date();
		//date.setDate(date.getDate()-2);
		var year = new Date().getFullYear();
		var month = eval(date.getMonth()+1).toString().length>1 ? eval(date.getMonth()+1).toString() : "0" + eval(date.getMonth()+1);  
		var dateStr = date.getDate().toString().length>1 ? date.getDate() : "0" + date.getDate(); 
		
		majstoriDB.find({}).toArray()
		.then((majstori)=>{
			var majstorIdArray = [];
			for(var i=0;i<majstori.length;i++){
				majstorIdArray.push(majstori[i].uniqueId)
				if(podizvodjaci.indexOf(majstori[i].uniqueId)>=0 || !majstori[i].aktivan){
					majstori.splice(i,1);
					i--;
				}
			}
			pomocniciDB.find({}).toArray()
			.then((pomocnici)=>{
				for(var i=0;i<pomocnici.length;i++){
					if(!pomocnici[i].aktivan){
						pomocnici.splice(i,1);
						i--;
					}
				}
				usersDB.find({}).toArray()
				.then((users)=>{
					for(var i=0;i<users.length;i++){
						delete users[i].password;
						delete users[i].resetPassDate;
						delete users[i].resetPassId;
						delete users[i].resetPassTime;
						delete users[i]._id;
						users[i].ime = users[i].name;
						users[i].uniqueId = users[i].email;
					}
					checkInMajstoraDB.find({year:year,month:month,date:dateStr}).toArray()
					.then((checkIns)=>{

						res.render("prisustvo",{
					    pageTitle: "Присуство радника на дан "+getDateAsStringForDisplay(date),
					    pomocnici: pomocnici,
					    majstori: majstori,
					    user: req.session.user,
					    users: users,
					    checkIns: checkIns
					  });
				  })
				  .catch((error)=>{
						logError(error);
						res.send("Greska 4")	
					})

				})
				.catch((error)=>{
					logError(error);
					res.send("Greska 5")	
				})
							
			})
			.catch((error)=>{
				logError(error);
				res.send("Greska 3")	
			})
		})
		.catch((error)=>{
			logError(error);
			res.send("Greska")
		})	
	}else{
		res.redirect("/login?url="+encodeURIComponent(req.url));
	}
});

server.get('/prisustvo/:datum', async (req, res)=> {
	if(req.session.user){
		var date = new Date(req.params.datum);
		//date.setDate(date.getDate()-2);
		var year = new Date().getFullYear();
		var month = eval(date.getMonth()+1).toString().length>1 ? eval(date.getMonth()+1).toString() : "0" + eval(date.getMonth()+1);  
		var dateStr = date.getDate().toString().length>1 ? date.getDate() : "0" + date.getDate(); 
		
		majstoriDB.find({}).toArray()
		.then((majstori)=>{
			var majstorIdArray = [];
			for(var i=0;i<majstori.length;i++){
				majstorIdArray.push(majstori[i].uniqueId)
				if(podizvodjaci.indexOf(majstori[i].uniqueId)>=0 || !majstori[i].aktivan){
					majstori.splice(i,1);
					i--;
				}
			}
			pomocniciDB.find({}).toArray()
			.then((pomocnici)=>{
				for(var i=0;i<pomocnici.length;i++){
					if(!pomocnici[i].aktivan){
						pomocnici.splice(i,1);
						i--;
					}
				}
				usersDB.find({}).toArray()
				.then((users)=>{
					for(var i=0;i<users.length;i++){
						delete users[i].password;
						delete users[i].resetPassDate;
						delete users[i].resetPassId;
						delete users[i].resetPassTime;
						delete users[i]._id;
						users[i].ime = users[i].name;
						users[i].uniqueId = users[i].email;
					}
					checkInMajstoraDB.find({year:year,month:month,date:dateStr}).toArray()
					.then((checkIns)=>{

						res.render("prisustvo",{
					    pageTitle: "Присуство мајстора на дан "+getDateAsStringForDisplay(date),
					    pomocnici: pomocnici,
					    majstori: majstori,
					    user: req.session.user,
					    users: users,
					    checkIns: checkIns
					  });
				  })
				  .catch((error)=>{
						logError(error);
						res.send("Greska 4")	
					})
				})
				.catch((error)=>{
					logError(error);
					res.send("Greska 5")	
				})			
			})
			.catch((error)=>{
				logError(error);
				res.send("Greska 3")	
			})
		})
		.catch((error)=>{
			logError(error);
			res.send("Greska")
		})	
	}else{
		res.redirect("/login?url="+encodeURIComponent(req.url));
	}
});


server.get('/mesecnoPrisustvo', async (req, res)=> {
	if(req.session.user){
		majstoriDB.find({}).toArray()
		.then((majstori)=>{
			var majstorIdArray = [];
			for(var i=0;i<majstori.length;i++){
				majstorIdArray.push(majstori[i].uniqueId)
				if(podizvodjaci.indexOf(majstori[i].uniqueId)>=0 || !majstori[i].aktivan){
					majstori.splice(i,1);
					i--;
				}
			}
			pomocniciDB.find({}).toArray()
			.then((pomocnici)=>{
				for(var i=0;i<pomocnici.length;i++){
					if(!pomocnici[i].aktivan){
						pomocnici.splice(i,1);
						i--;
					}
				}
				usersDB.find({}).toArray()
				.then((users)=>{
					for(var i=0;i<users.length;i++){
						delete users[i].password;
						delete users[i].resetPassDate;
						delete users[i].resetPassId;
						delete users[i].resetPassTime;
						delete users[i]._id;
						users[i].ime = users[i].name;
						users[i].uniqueId = users[i].email;
					}
					res.render("mesecnoPrisustvoOdabir",{
				    pageTitle: "Одабери мајстора/помоћника и месец: ",
				    pomocnici: pomocnici,
				    majstori: majstori,
				    users:users,
				    user: req.session.user
				  });
				})
				.catch((error)=>{
					logError(error);
					res.send("Greska 3")	
				})
			})
			.catch((error)=>{
				logError(error);
				res.send("Greska 3")	
			})
		})
		.catch((error)=>{
			logError(error);
			res.send("Greska")
		})	
		
	}else{
		res.redirect("/login?url="+encodeURIComponent(req.url));
	}
});


/*server.get('/mesecnoPrisustvo/:mesec/:majstor', async (req, res)=> {
	if(req.session.user){
		//console.log(req.params.mesec.split(".")[0] +"-"+req.params.mesec.split(".")[1])
		checkInMajstoraDB.find({uniqueId:req.params.majstor,month:req.params.mesec.split(".")[0].toString(),year:Number(req.params.mesec.split(".")[1])}).toArray()
		.then((checkIns)=>{
			dodeljivaniNaloziDB.find({majstor:req.params.majstor,"datum.datum":{$regex:req.params.mesec}}).toArray()
			.then((dodele)=>{
				
					majstoriDB.find({uniqueId:req.params.majstor}).toArray()
					.then((majstori)=>{
						if(majstori.length>0){
							var majstor = majstori[0];
							stariUcinakMajstoraDB.find({majstor:majstor.vezaSaStarimPortalom,datum:{$regex:req.params.mesec.split(".")[1]+"-"+req.params.mesec.split(".")[0]}}).toArray()
							.then((ucinci)=>{
								res.render("mesecnoPrisustvo",{
							    pageTitle: "Месечно присуство мајстора "+majstor.ime+" за месец "+req.params.mesec,
							    majstor: majstor,
							    checkIns: checkIns,
							    ucinci: ucinci,
							    dodele: dodele,
							    month: req.params.mesec.split(".")[0],
							    year: req.params.mesec.split(".")[1],
							    user: req.session.user
							  });
							})
							.catch((error)=>{
								logError(error);
								res.send("Greska 8");
							})
							
						}else{
							pomocniciDB.find({uniqueId:req.params.majstor}).toArray()
							.then((pomocnici)=>{
								if(pomocnici.length>0){
									var majstor = pomocnici[0];
									res.render("mesecnoPrisustvo",{
								    pageTitle: "Месечно присуство мајстора "+majstor.ime+" за месец "+req.params.mesec,
								    majstor: majstor,
								    checkIns: checkIns,
								    ucinci: [],
								    dodele: dodele,
								    month: req.params.mesec.split(".")[0],
								    year: req.params.mesec.split(".")[1],
								    user: req.session.user
								  });
								}else{
									res.send("Neposotjeci majstor");
								}
							})
							.catch((error)=>{
								logError(error);
								res.send("Greska 3")	
							})
						}
					})
					.catch((error)=>{
						logError(error);
						res.send("Greska 2")
					})
			})
			.catch((error)=>{
				logError(error);
				res.send("Greska 7")
			})
				
		})
		.catch((error)=>{
			logError(error);
			res.send("Greska")
		})
			
		
	}else{
		res.redirect("/login?url="+encodeURIComponent(req.url));
	}
});*/

server.get('/mesecnoPrisustvo/:mesec/:majstor', async (req, res)=> {
	if(req.session.user){
		//console.log({uniqueId:req.params.majstor,month:req.params.mesec.split(".")[0],year:req.params.mesec.split(".")[1]})
		checkInMajstoraDB.find({uniqueId:req.params.majstor,month:req.params.mesec.split(".")[0],year:{$in:[req.params.mesec.split(".")[1],Number(req.params.mesec.split(".")[1])]}}).toArray()
		.then((checkIns)=>{
			opomeneDB.find({uniqueId:req.params.majstor,month:req.params.mesec.split(".")[0],year:{$in:[req.params.mesec.split(".")[1],Number(req.params.mesec.split(".")[1])]}}).toArray()
			.then((opomene)=>{
				if(req.params.majstor.includes("@")){
					usersDB.find({email:req.params.majstor}).toArray()
					.then((users)=>{
						if(users.length>0){
							users[0].ime = users[0].name;
							res.render("mesecnoPrisustvo",{
						    pageTitle: "Месечно присуство мајстора "+users[0].ime+" за месец "+req.params.mesec,
						    majstor: users[0],
						    checkIns: checkIns,
						    opomene: 	opomene,
						    month: req.params.mesec.split(".")[0],
						    year: req.params.mesec.split(".")[1],
						    user: req.session.user
						  });
						}else{
							res.send("Nepostojeci radnik")
						}
					})
					.catch((error)=>{
						logError(error);
						res.send("Greska 4");
					})
				}else{
					majstoriDB.find({uniqueId:req.params.majstor}).toArray()
					.then((majstori)=>{
						pomocniciDB.find({uniqueId:req.params.majstor}).toArray()
						.then((pomocnici)=>{
							if(majstori.length>0 || pomocnici.length>0){
								res.render("mesecnoPrisustvo",{
							    pageTitle: `Месечно присуство мајстора ${majstori.length > 0 ? majstori[0].ime : pomocnici.length > 0 ? pomocnici[0].ime : 'Непостојећи'} за месец ${req.params.mesec}`,
							    majstor: majstori.length>0 ? majstori[0] : pomocnici.length>0 ? pomocnici[0] : {},
							    checkIns: checkIns,
						    	opomene: 	opomene,
							    month: req.params.mesec.split(".")[0],
							    year: req.params.mesec.split(".")[1],
							    user: req.session.user
							  });
							}else{
								res.send("Nepostojeci radnik")
							}
						})
						.catch((error)=>{
							logError(error);
							res.send("Greska 3");
						})
					})
					.catch((error)=>{
						logError(error);
						res.send("Greska 2");
					})
				}
			})
			.catch((error)=>{
				logError(error);
				res.send("Greska 1");
			})
		})
		.catch((error)=>{
			logError(error);
			res.send("Greska 0");
		})
	}else{
		res.redirect("/login?url="+encodeURIComponent(req.url));
	}
});



server.get('/majstor/nalozi', async (req, res)=> {
	if(req.session.user){
		if(Number(req.session.user.role)==60){
			var today = new Date();
			today.setDate(today.getDate());
			try{
				var today = new Date();
				today.setDate(today.getDate());
				var nalozi = await dodeljivaniNaloziDB.find({majstor:req.session.user.uniqueId,"datum.datum":getDateAsStringForDisplay(today)}).toArray();
				var brojeviNaloga = [];
				for(var i=0;i<nalozi.length;i++){
					if(brojeviNaloga.indexOf(nalozi[i].nalog)<0){
						brojeviNaloga.push(nalozi[i].nalog);
					}
				}
				var nalozi2 = await naloziDB.find({broj:{$in:brojeviNaloga}}).toArray();
				for(var i=0;i<nalozi.length;i++){
					nalozi[i].izvestaji = [];
					for(var j=0;j<nalozi2.length;j++){
						if(nalozi2[j].broj==nalozi[i].nalog){
							nalozi[i].opis = nalozi2[j].opis;
							nalozi[i].zahtevalac = nalozi2[j].zahtevalac;
						}
					}
				}
				var izvestaji = await izvestajiDB.find({nalog:{$in:brojeviNaloga}}).toArray();
				for(var i=0;i<nalozi.length;i++){
					for(var j=0;j<izvestaji.length;j++){
						if(izvestaji[j].nalog==nalozi[i].nalog){
							nalozi[i].izvestaji.push(izvestaji[j]);
						}
					}
				}
				res.render("majstor/nalozi",{
					pageTitle: "Данашњи налози",
					user: req.session.user,
					nalozi: nalozi
				});
			}catch(err){
				logError(error);
				res.render("message",{
          pageTitle: "Грешка",
          user: req.session.user,
          message: "<div class=\"text\">Грешка у бази података 6690.</div>"
        });
			}
		}else{
			res.render("message",{
				pageTitle: "Грешка",
				user: req.session.user,
				message: "<div class=\"text\">Ваш налог није овлашћен да види ову страницу.</div>"
			});
		}
	}else{
		res.redirect("/login?url="+encodeURIComponent(req.url));
	} 
});

server.get('/majstor/mesec', async (req, res)=> {
	res.redirect("/majstor/mesec/"+eval(new Date().getMonth()+1).toString().padStart(2,"0")+"."+new Date().getFullYear())
});

server.get('/majstor/mesec/:datum', async (req, res)=> {
	if(req.session.user){
		if(Number(req.session.user.role)==60){
			try{
				var izvestaji = await dnevniIzvestajiDB.find({majstor:req.session.user.uniqueId,date:{$regex:req.params.datum.split(".")[1]+"-"+req.params.datum.split(".")[0]}}).toArray();
				res.render("majstor/majstorMesec",{
					user: req.session.user,
					pageTitle: "Pregled za "+req.params.datum,
					datum: req.params.datum,
					izvestaji: izvestaji
				})
			}catch(err){
				logError(err)
				res.render("message",{
          pageTitle: "Грешка",
          user: req.session.user,
          message: "<div class=\"text\">Грешка у бази података 12138.</div>"
        });
			}
		}else{
			res.render("message",{
				pageTitle: "Грешка",
				user: req.session.user,
				message: "<div class=\"text\">Ваш налог није овлашћен да види ову страницу.</div>"
			});
		}
	}else{
		res.redirect("/login?url="+encodeURIComponent(req.url));
	}
});

server.post('/izvestaj-majstora', async (req, res)=> {
	if(req.session.user){
		if(Number(req.session.user.role)==60){
				uploadSlika(req, res, function (error) {
				    if (error) {
				      logError(error);
				      return res.render("message",{pageTitle: "Грешка",message: "<div class=\"text\">Дошло је до грешке приликом качења слика.</div>",user: req.session.user});
				    }
				    var nalogJson = JSON.parse(req.body.json);
				    var izvestajJson = {};
				    izvestajJson.uniqueId 	=	new Date().getTime() +"--"+generateId(5);
				    izvestajJson.nalog		=	nalogJson.nalog;
				    izvestajJson.datetime 	=	new Date().getTime();
				    izvestajJson.datum		=	getDateAsStringForDisplay(new Date(Number(izvestajJson.datetime)));
				    izvestajJson.izvestaj	=	nalogJson.izvestaj;
				    izvestajJson.user 		=	req.session.user;
				    izvestajJson.photos		=	[];
				    //izvestajJson.signature = nalogJson.signature ? nalogJson.signature : [];
				    for(var i=0;i<req.files.length;i++){
				    	izvestajJson.photos.push(req.files[i].transforms[0].location)
				    }
						izvestajiDB.insertOne(izvestajJson)
						.then((dbResponse)=>{
							var mailOptions = {
								from: '"ВиК Портал Послова Града" <admin@poslovigrada.rs>',
								to: nalogJson.email,
								subject: 'Нови извештај мајстора на налогу број '+nalogJson.nalog,
								html: 'Поштовани/а '+nalogJson.dispecer+' <br>,'+izvestajJson.user.ime+' је окачио нови извештај за налог број '+izvestajJson.nalog+' / '+nalogJson.radnaJedinica+' / '+nalogJson.adresa+'.<br><a href=\"https://vik2024.poslovigrada.rs/nalog/'+izvestajJson.nalog+'\">Отвори налог на порталу</a>.'
							};

							transporter.sendMail(mailOptions, (error, info) => {
								if (error) {
									logError(error);
									res.redirect("/majstor/nalozi");
								}else{
									res.redirect("/majstor/nalozi");
								}
							})
						})
						.catch((error)=>{
							logError(error);
							res.render("message",{
								pageTitle: "Програмска грешка",
								user:req.session.user,
								message: "<div class=\"text\">Дошло је до грешке у бази податка 6784.</div>"
							});
						})
						
					
					
				});
			
		}else{
			res.send("Nije definisan nivo korisnika");
		}
	}else{
		res.redirect("/login");
	}
});

server.post('/statusOdMajstora', async (req, res)=> {
	if(req.session.user){
		if(Number(req.session.user.role)==60){
			var statusCode = req.body.code;
			var uniqueId = req.body.statusid;
			var currentDate = new Date();
			var setObj = false;
			if(Number(statusCode)==0){
				setObj	=	{ $set: {
					odlazak: {
						datetime: new Date().getTime(),
				    datum: getDateAsStringForDisplay(new Date())
					}
				}};
			}else if(Number(statusCode)==1){
				setObj	=	{ $set: {
					dolazak: {
						datetime: new Date().getTime(),
				    datum: getDateAsStringForDisplay(new Date())
					}
				}};
			}else if(Number(statusCode)==2){
				setObj	=	{ $set: {
					zavrsetak: {
						datetime: new Date().getTime(),
				    datum: getDateAsStringForDisplay(new Date())
					}
				}};
			}
			if(setObj){
				dodeljivaniNaloziDB.updateOne({uniqueId:uniqueId},setObj)
				.then((dbResponse)=>{
					res.redirect("/majstor/nalozi?openmap=1")
				})
				.catch((error)=>{
					logError(error);
					res.send("Greska u bazi podataka");
				})
			}else{
				res.send("Greska")
			}
		}else{
			res.send("Nije definisan nivo korisnika");
		}
	}else{
		res.redirect("/login");
	}
});




server.get('/magacin/ekipe', async (req, res)=> {
	if(req.session.user){
		if(Number(req.session.user.role)==50 || Number(req.session.user.role)==25){
			var today = new Date();
			var yesterday = new Date();
			yesterday.setDate(today.getDate()-1);
			var date = new Date();
			var year = date.getFullYear();
			var month = eval(date.getMonth()+1).toString().length>1 ? eval(date.getMonth()+1).toString() : "0" + eval(date.getMonth()+1);  
			var date = date.getDate().toString().length>1 ? date.getDate() : "0" + date.getDate(); 

			pomocniciDB.find({}).toArray()
			.then((pomocnici)=>{
				for(var i=0;i<pomocnici.length;i++){
					if(!pomocnici[i].aktivan){
						pomocnici.splice(i,1);
						i--
					}
				}
				majstoriDB.find({}).toArray()
				.then((majstori)=>{
					for(var i=0;i<majstori.length;i++){
						if(!majstori[i].aktivan || podizvodjaci.indexOf(majstori[i].uniqueId)>=0){
							majstori.splice(i,1);
							i--
						}
					}
					navigacijaInfoDB.find({}).toArray()
					.then((vozila)=>{
						checkInMajstoraDB.find({year:year,month:month,date:date}).toArray()
						.then((checkIns)=>{
							ekipeDB.find({"datum.datum":getDateAsStringForDisplay(today)}).toArray()
							.then((ekipe)=>{
								if(ekipe.length==0){
									/*today.setDate(today.getDate()-1)
									ekipeDB.find({"datum.datum":getDateAsStringForDisplay(today)}).toArray()
									.then((ekipeJuce)=>{
										//console.log(ekipeJuce)
										res.render("magacioner/ekipe",{
											pageTitle: "Екипе",
											user: req.session.user,
											pomocnici: pomocnici,
											vozila: vozila,
											majstori: majstori,
											checkIns: checkIns,
											ekipe: ekipeJuce[ekipeJuce.length-1]
										});
									})
									.catch((error)=>{
										logError(error);
										res.render("message",{
						          pageTitle: "Грешка",
						          user: req.session.user,
						          message: "<div class=\"text\">Грешка у бази података 7622.</div>"
						        });
									})*/
									//today.setDate(today.getDate()-1)
									ekipeDB.find({}).toArray()
									.then((ekipeJuce)=>{
										//console.log(ekipeJuce)
										res.render("magacioner/ekipe",{
											pageTitle: "Екипе",
											user: req.session.user,
											pomocnici: pomocnici,
											vozila: vozila,
											majstori: majstori,
											checkIns: checkIns,
											ekipe: ekipeJuce[ekipeJuce.length-1]
										});
									})
									.catch((error)=>{
										logError(error);
										res.render("message",{
						          pageTitle: "Грешка",
						          user: req.session.user,
						          message: "<div class=\"text\">Грешка у бази података 7622.</div>"
						        });
									})
								}else{
									res.render("magacioner/ekipe",{
										pageTitle: "Екипе",
										user: req.session.user,
										pomocnici: pomocnici,
										vozila: vozila,
										majstori: majstori,
										checkIns: checkIns,
										ekipe: ekipe[ekipe.length-1]
									});
								}
								
							})
							.catch((error)=>{
								logError(error);
								res.render("message",{
				          pageTitle: "Грешка",
				          user: req.session.user,
				          message: "<div class=\"text\">Грешка у бази података 7622.</div>"
				        });
							})
							
						})
						.catch((error)=>{
							logError(error);
							res.render("message",{
			          pageTitle: "Грешка",
			          user: req.session.user,
			          message: "<div class=\"text\">Грешка у бази података 7622.</div>"
			        });
						})
						
					})
					.catch((error)=>{
						logError(error);
						res.render("message",{
		          pageTitle: "Грешка",
		          user: req.session.user,
		          message: "<div class=\"text\">Грешка у бази података 7622.</div>"
		        });
					})
				})
			})
			.catch((error)=>{
				logError(error);
				res.render("message",{
          pageTitle: "Грешка",
          user: req.session.user,
          message: "<div class=\"text\">Грешка у бази података 7622.</div>"
        });	
			})
		}else{
			res.render("message",{
				pageTitle: "Грешка",
				user: req.session.user,
				message: "<div class=\"text\">Ваш налог није овлашћен да види ову страницу.</div>"
			});
		}
	}else{
		res.redirect("/login?url="+encodeURIComponent(req.url));
	} 
});

server.post('/ekipe', async (req, res)=> {
	if(req.session.user){
		if(Number(req.session.user.role)==50 || Number(req.session.user.role)==25){
			var json = {}
			json.prisustvo = JSON.parse(req.body.json);
			json.datum = {};
			json.datum.datum = getDateAsStringForDisplay(new Date());
			json.datum.datetime = new Date().getTime();
			json.user = req.session.user;
			json.uniqueId = generateId(6) + "--" + new Date().getTime();
			ekipeDB.find({"datum.datum":getDateAsStringForDisplay(new Date())}).toArray()
			.then((prisustva)=>{
				if(prisustva.length==0){
					ekipeDB.insertOne(json)
					.then((dbResponse)=>{
						res.redirect("/")
						io.emit("ekipeStigle",json);
					})
					.catch((error)=>{
						logError(error)
						res.render("message",{
		          pageTitle: "Грешка",
		          user: req.session.user,
		          message: "<div class=\"text\">Грешка у бази података 7725.</div>"
		        });
					})
				}else{
					ekipeDB.replaceOne({uniqueId:prisustva[0].uniqueId},json)
					.then((dbResponse)=>{
						res.redirect("/");
						io.emit("ekipeStigle",json);
					})
					.catch((error)=>{
						logError(error)
						res.render("message",{
		          pageTitle: "Грешка",
		          user: req.session.user,
		          message: "<div class=\"text\">Грешка у бази података 7740.</div>"
		        });
					})
				}
			})
			.catch((error)=>{
				logError(error)
				res.render("message",{
          pageTitle: "Грешка",
          user: req.session.user,
          message: "<div class=\"text\">Грешка у бази података 7739.</div>"
        });
			})
		}else{
			res.send("Nije definisan nivo korisnika");
		}
	}else{
		res.redirect("/login");
	}
});

server.get('/magacin/vozila', async (req, res)=> {
	if(req.session.user){
		if(Number(req.session.user.role)==50 || Number(req.session.user.role)==25){
			navigacijaInfoDB.find({}).toArray()
			.then((vozila)=>{
				majstoriDB.find({}).toArray()
				.then((majstori)=>{
					res.render("magacioner/vozila",{
						pageTitle: "Возила",
						user: req.session.user,
						vozila: vozila,
						majstori: majstori
					});
				})
			})
			.catch((error)=>{
				logError(error);
				res.render("message",{
          pageTitle: "Грешка",
          user: req.session.user,
          message: "<div class=\"text\">Грешка у бази података 7622.</div>"
        });	
			})
		}else{
			res.render("message",{
				pageTitle: "Грешка",
				user: req.session.user,
				message: "<div class=\"text\">Ваш налог није овлашћен да види ову страницу.</div>"
			});
		}
	}else{
		res.redirect("/login?url="+encodeURIComponent(req.url));
	}
});

server.get('/magacioner/tabla', async (req, res)=> {
	if(req.session.user){
		if(Number(req.session.user.role)==50 || Number(req.session.user.role)==25){
			try{
				var yesterday = new Date();
				yesterday.setDate(yesterday.getDate()-1);
				var reversi = await magacinReversiDB.find({datum:getDateAsStringForDisplay(yesterday)}).toArray();
				var validiraniNalozi = await naloziDB.find({"prijemnica.datum.datum":{$regex:eval(yesterday.getMonth()+1).toString().padStart(2,"0")+"."+yesterday.getFullYear()}}).toArray();
				var otvoreniNalozi = await naloziDB.find({statusNaloga:{$nin:["Završeno","Nalog u Stambenom","Fakturisan","Spreman za fakturisanje","Storniran"]}}).toArray();
			
				var naloziZaReverse = [];
				for(var i=0;i<reversi.length;i++){
						naloziZaReverse.push(reversi[i].nalog)
				}
				var reversNalozi = await naloziDB.find({broj:{$in:naloziZaReverse}}).toArray();

				for(var i=0;i<reversi.length;i++){
					reversi[i].radnaJedinica = "Treca lica";
					for(var j=0;j<reversNalozi.length;j++){
						if(reversi[i].nalog==reversNalozi[j].broj){
							reversi[i].radnaJedinica = reversNalozi[j].radnaJedinica
						}
					}
				}

				var json = {};
				json.zameneIstok = 0;
				json.zameneZapad = 0;
				json.rovoviIstok = 0;
				json.rovoviZapad = 0;
				json.finalizacijaIstok = 0;
				json.finalizacijaZapad = 0;
				json.reklamacijeIstok = 0;
				json.reklamacijeZapad = 0;
				json.kasnjenjeIstok = 0;
				json.kasnjenjeZapad = 0;

				for(var i=0;i<reversi.length;i++){
					if(reversi[i].tip=="Zamena" || reversi[i].tip=="PromenaTE"){
						if(istok.indexOf(reversi[i].radnaJedinica)>=0){
							json.zameneIstok++;
						}else if(zapad.indexOf(reversi[i].radnaJedinica)>=0){
							json.zameneZapad++;
						}
					}else if(reversi[i].tip=="Reklamacija"){
						if(istok.indexOf(reversi[i].radnaJedinica)>=0){
							json.reklamacijeIstok++;
						}else if(zapad.indexOf(reversi[i].radnaJedinica)>=0){
							json.reklamacijeZapad++;
						}
					}else{
						console.log(reversi[i].tip)
					}
				}

				var rovoviBrojeviNaloga = [];
				var rovNalozi = [];
				for(var i=0;i<otvoreniNalozi.length;i++){
					if(otvoreniNalozi[i].statusNaloga=="Kopanje" && rovoviBrojeviNaloga.indexOf(otvoreniNalozi[i])<0){
						rovoviBrojeviNaloga.push(otvoreniNalozi[i].broj);
						rovNalozi.push(otvoreniNalozi[i])
					}
				}
				
				for(var i=0;i<validiraniNalozi.length;i++){
					if(rovoviBrojeviNaloga.indexOf(validiraniNalozi[i])<0){
						var kopanja = ['80.03.01.020','80.03.01.019','80.03.01.001','80.03.01.002','80.03.01.003','80.03.01.004','80.03.01.005','80.03.01.006'];
						for(var j=0;j<validiraniNalozi[i].obracun.length;j++){
							
							if(kopanja.indexOf(validiraniNalozi[i].obracun[j].code)>=0 &&  rovoviBrojeviNaloga.indexOf(validiraniNalozi[i].broj)<0){
								rovNalozi.push(validiraniNalozi[i].broj)
								rovoviBrojeviNaloga.push(validiraniNalozi[i]);
								break;
								
							}
						}
					}
				}

				for(var i=0;i<rovNalozi.length;i++){
					if(istok.indexOf(rovNalozi[i].radnaJedinica)>=0){
						json.rovoviIstok++;
					}else if(zapad.indexOf(rovNalozi[i].radnaJedinica)>=0){
						json.rovoviZapad++;
					}
				}

				for(var i=0;i<otvoreniNalozi.length;i++){
					if(otvoreniNalozi[i].statusNaloga=="Finalizacija" || otvoreniNalozi[i].statusNaloga=="Zakazana finalizacija"){
						if(istok.indexOf(otvoreniNalozi[i].radnaJedinica)>=0){
							json.finalizacijaIstok++;
						}else if(zapad.indexOf(otvoreniNalozi[i].radnaJedinica)>=0){
							json.finalizacijaZapad++;
						}
					}
				}

				for(var i=0;i<otvoreniNalozi.length;i++){
					var today = new Date();
					var nalogTime = otvoreniNalozi[i].datum.datetime;
					if( ((today.getTime() - nalogTime)/1000/60/60)>24 ){
						if(istok.indexOf(otvoreniNalozi[i].radnaJedinica)>=0){
							json.kasnjenjeIstok++;
						}else if(zapad.indexOf(otvoreniNalozi[i].radnaJedinica)>=0){
							json.kasnjenjeZapad++;
						}
					}
					
				}


				res.render("magacioner/tabla",{
          pageTitle: "Табла",
          user: req.session.user,
          reversi: reversi,
          json: json
        });
			}catch(error){
				logError(error);
				res.render("message",{
          pageTitle: "Грешка",
          user: req.session.user,
          message: "<div class=\"text\">Грешка у бази података 7622.</div>"
        });	
			}
			
		}else{
			res.render("message",{
				pageTitle: "Грешка",
				user: req.session.user,
				message: "<div class=\"text\">Ваш налог није овлашћен да види ову страницу.</div>"
			});
		}
	}else{
		res.redirect("/login?url="+encodeURIComponent(req.url));
	}
});

server.get('/magacioner/dvonedeljnaPotrosnja', async (req, res)=> {
	if(req.session.user){
		if(Number(req.session.user.role)==50){
			try{
				const startDate = new Date();
			  const chunks = [];

			  for (let w = 0; w < 4; w++) {
			    const chunk = {};
			    chunk.dates = [];
			    for (let d = 0; d < 14; d++) {
			      const date = new Date(startDate);
			      date.setDate(startDate.getDate() - (w * 14 + d));
			      chunk.dates.push(getDateAsStringForDisplay(date)); // format YYYY-MM-DD
			    }
			    chunks.push(chunk);
			  }
			  var proizvodi = await proizvodiDB.find({}).toArray();
			  for(var i=0;i<chunks.length;i++){
			  	var reversi = await magacinReversiDB.find({datum:{$in:chunks[i].dates}}).toArray()
			  	chunks[i].reversi = JSON.parse(JSON.stringify(reversi));
			  	chunks[i].spojenaPotrosnja = [];
			  	for(var j=0;j<chunks[i].reversi.length;j++){
			  		for(var k=0;k<chunks[i].reversi[j].zaduzenje.length;k++){
			  			chunks[i].reversi[j].zaduzenje[k].code = "0";
			  			for(var l=0;l<proizvodi.length;l++){
			  				if(chunks[i].reversi[j].zaduzenje[k].uniqueId==proizvodi[l].uniqueId){
			  					chunks[i].reversi[j].zaduzenje[k].code = proizvodi[l].code;
			  				}
			  			}

			  			var proizvodIndex = -1;
				  		for(var l=0;l<chunks[i].spojenaPotrosnja.length;l++){
				  			if(chunks[i].reversi[j].zaduzenje[k].uniqueId==chunks[i].spojenaPotrosnja[l].uniqueId){
				  				proizvodIndex = l;
				  				break;
				  			}
				  		}
				  		var uzeto = isNaN(parseFloat(chunks[i].reversi[j].zaduzenje[k].quantity)) ? 0 : parseFloat(chunks[i].reversi[j].zaduzenje[k].quantity);
				  		var vraceno = isNaN(parseFloat(chunks[i].reversi[j].zaduzenje[k].quantity2)) ? 0 : parseFloat(chunks[i].reversi[j].zaduzenje[k].quantity2);
				  		
				  		var utroseno = uzeto - vraceno;
				  		
				  		if(proizvodIndex==-1){
				  			chunks[i].spojenaPotrosnja.push({uniqueId:chunks[i].reversi[j].zaduzenje[k].uniqueId,code:chunks[i].reversi[j].zaduzenje[k].code,utroseno:utroseno});
				  		}else{
				  			chunks[i].spojenaPotrosnja[proizvodIndex].utroseno = chunks[i].spojenaPotrosnja[proizvodIndex].utroseno + utroseno;
				  		}

				  		
			  		}
			  	}
			  }

			  for(var i=0;i<chunks.length;i++){
			  	chunks[i].spojenaPotrosnja.sort((a, b) => a.code.localeCompare(b.code));
			  }
			  
				res.render("magacioner/dvonedeljnaPotrosnja",{
					pageTitle: "Двонедељна потрошња материјала",
					user: req.session.user,
					potrosnja: chunks,
					proizvodi: proizvodi
				});

			}catch(error){
				logError(error);
				res.render("message",{
					pageTitle: "Програмска грешка",
					user: req.session.user,
					message: "<div class=\"text\">Грешка у бази података.</div>"
				});
			}
			
		}else{
			res.render("message",{
				pageTitle: "Грешка",
				user: req.session.user,
				message: "<div class=\"text\">Ваш налог није овлашћен да види ову страницу.</div>"
			});
		}
	}else{
		res.redirect("/login?url="+encodeURIComponent(req.url));
	} 
});

server.get('/magacioner/jucerasnjiMaterijal', async (req, res)=> {
	if(req.session.user){
		if(Number(req.session.user.role)==50){
			try{
				var yesterday = new Date();
				yesterday.setDate(yesterday.getDate()-1);
				var proizvodi = await proizvodiDB.find({}).toArray();
				var reversi = await magacinReversiDB.find({datum:getDateAsStringForDisplay(yesterday)}).toArray();
				var majstori = await majstoriDB.find({}).toArray();
				var stavke = [];
				for(var i=0;i<reversi.length;i++){
					for(var j=0;j<reversi[i].zaduzenje.length;j++){
						var indexStavke = -1;
						for(var k=0;k<stavke.length;k++){
							if(stavke[k].uniqueId==reversi[i].zaduzenje[j].uniqueId){
								indexStavke = k;
								break;
							}
						}
						if(indexStavke>=0){
							stavke[indexStavke].kolicina += parseFloat(reversi[i].zaduzenje[j].quantity);
						}else{
							var stavkaJson = {};
							stavkaJson.uniqueId = reversi[i].zaduzenje[j].uniqueId;
							stavkaJson.kolicina = parseFloat(reversi[i].zaduzenje[j].quantity);
							stavke.push(stavkaJson);
							//console.log(stavke)
						}

					}
				}

				for(var i=0;i<stavke.length;i++){
					for(var j=0;j<proizvodi.length;j++){
						if(stavke[i].uniqueId==proizvodi[j].uniqueId){
							stavke[i].naziv = proizvodi[j].name;
						}
					}
				}



				//console.log(stavke);
				res.render("magacioner/jucersanjeStavke",{
					pageTitle:"Јучерашње ставке",
					user: req.session.user,
					stavke: stavke
				})
			}catch(err){
				logError(err)
				res.render("message",{
					pageTitle: "Програмска грешка",
					user: req.session.user,
					message: "<div class=\"text\">Грешка у бази података 12368.</div>"
				});
			}
			
		}else{
			res.render("message",{
				pageTitle: "Грешка",
				user: req.session.user,
				message: "<div class=\"text\">Ваш налог није овлашћен да види ову страницу.</div>"
			});
		}
	}else{
		res.redirect("/login?url="+encodeURIComponent(req.url));
	} 
});

server.post('/nalozi/:stringdata',async (req,res)=>{
	var receivedString	=	req.params.stringdata;
	var naloziArray		=	receivedString.split("_");
	naloziDB.find({broj:{$in:naloziArray}}).toArray()
	.then((nalozi)=>{
		var sendString = "ODGOVOR#";
		for(var i=0;i<naloziArray.length;i++){
			var iznosNaloga = "0";
			for(var j=0;j<nalozi.length;j++){
				if(naloziArray[i]==nalozi[j].broj){
					iznosNaloga = nalozi[j].ukupanIznos;
					break;
				}
			}
			sendString 	=	sendString + iznosNaloga + ":";
		}
		sendString = sendString.substring(0,sendString.length-1)
		res.send(sendString);
	})
	.catch((error)=>{
		console.log(error);
		res.send("Greska u bazi podataka");
	})
});

server.get('/majstorCheckIn/:servertoken/:tagId',async (req,res)=>{
	if(req.params.servertoken==process.env.servertoken){
		var date = new Date();
		date = new Date(date.getTime())
		var year = date.getFullYear();
		var datetime = date.getTime();
		var minutes = date.getMinutes().toString().length>1 ? date.getMinutes() : "0" + date.getMinutes(); 
		var hours = date.getHours().toString().length>1 ? date.getHours() : "0" + date.getHours(); 
		var month = eval(date.getMonth()+1).toString().length>1 ? eval(date.getMonth()+1).toString() : "0" + eval(date.getMonth()+1);  
		var date = date.getDate().toString().length>1 ? date.getDate() : "0" + date.getDate(); 
		var vreme = date +"."+month+"."+year+" <i>"+hours+":"+minutes+"</i>";
		majstoriDB.find({brojKartice:Number(req.params.tagId)}).toArray()
		.then((majstori)=>{
			if(majstori.length>0){
				var json = {};
				json.uniqueId = majstori[0].uniqueId;
				json.brojKartice = majstori[0].brojKartice;
				json.datetime = datetime;
				json.month = month;
				json.date = date;
				json.year = year;
				json.timestamp = hours+":"+minutes;
				checkInMajstoraDB.insertOne(json)
				.then((dbResponse)=>{
					io.emit("majstorCheckedIn",json)
					res.render("majstorCheckedIn",{
						pageTitle: "Успешно чекирање",
						message: "САМО ГАС!",
						majstor: majstori[0],
						kartica: req.params.tagId,
						vreme: vreme,
						majstorType: 1
					})
				})
				.catch((error)=>{
					logError(error)
					res.render("messageNotLoggedIn",{
						pageTitle: "Грешка",
						message: "<div class=\"text\">Greska u bazi podataka</div>"
					});
				})
				
			}else{
				pomocniciDB.find({brojKartice:Number(req.params.tagId)}).toArray()
				.then((pomocnici)=>{
					if(pomocnici.length>0){
						var json = {};
						json.uniqueId = pomocnici[0].uniqueId;
						json.brojKartice = pomocnici[0].brojKartice;
						json.datetime = datetime;
						json.month = month;
						json.date = date;
						json.year = year;
						json.timestamp = hours+":"+minutes;
						checkInMajstoraDB.insertOne(json)
						.then((dbResponse)=>{
							io.emit("majstorCheckedIn",json)
							res.render("majstorCheckedIn",{
								pageTitle: "Успешно чекирањe",
								message: "САМО ГАС!",
								majstor: pomocnici[0],
								kartica: req.params.tagId,
								vreme: vreme,
								majstorType: 0
							});
						})
						.catch((error)=>{
							logError(error)
							res.render("messageNotLoggedIn",{
								pageTitle: "Грешка",
								message: "<div class=\"text\">Greska u bazi podataka</div>"
							});
						})
						
					}else{
						usersDB.find({brojKartice:Number(req.params.tagId)}).toArray()
						.then((users)=>{
							if(users.length>0){
								var json = {};
								json.uniqueId = users[0].email;
								json.brojKartice = users[0].brojKartice;
								json.datetime = datetime;
								json.month = month;
								json.date = date;
								json.year = year;
								json.timestamp = hours+":"+minutes;
								checkInMajstoraDB.insertOne(json)
								.then((dbResponse)=>{
									io.emit("majstorCheckedIn",json)
									res.render("majstorCheckedIn",{
										pageTitle: "Успешно чекирањe",
										message: "САМО ГАС!",
										majstor: users[0],
										kartica: req.params.tagId,
										vreme: vreme,
										majstorType: 2
									});
								})
								.catch((error)=>{
									logError(error)
									res.render("messageNotLoggedIn",{
										pageTitle: "Грешка",
										message: "<div class=\"text\">Greska u bazi podataka</div>"
									});
								})
								
							}else{
								res.render("majstorCheckedIn",{
									pageTitle: "Непозната картица. Obavestite magacionera!",
									majstor: {ime:"КО СТЕ ВИ!?!?"},
									message: "САМО ГАС!",
									majstorType: 0,
									vreme: vreme,
									kartica: req.params.tagId
								})
							}
							
						})
						.catch((error)=>{
							logError(error);
							res.render("messageNotLoggedIn",{
								pageTitle: "Грешка",
								message: "<div class=\"text\">Greska u bazi podataka</div>"
							});
						})
						
					}
					
				})
				.catch((error)=>{
					logError(error);
					res.render("messageNotLoggedIn",{
						pageTitle: "Грешка",
						message: "<div class=\"text\">Greska u bazi podataka</div>"
					});
				})
			}
		})
		.catch((error)=>{
			logError(error);
			res.render("messageNotLoggedIn",{
				pageTitle: "Грешка",
				message: "<div class=\"text\">Greska u bazi podataka</div>"
			});
		})
	}else{
		res.send("Greska u tokenu")
	}
});

server.get('/appLogIn/:servertoken/:deviceid',async (req,res)=>{
	if(req.params.servertoken==process.env.servertoken){
		if(!req.session.user){
			var deviceId = hashString(req.params.deviceid);
			majstoriDB.find({deviceId:deviceId}).toArray()
			.then((majstori)=>{
				if(majstori.length==0){
					res.render("appLogin",{
						pageTitle: "Пријавите се",
						deviceId: deviceId,
						serverToken: req.params.servertoken
					});
				}else{
					//Uloguj ga
					var sessionObject	=	JSON.parse(JSON.stringify(majstori[0]));
					sessionObject.role = 60;
					delete sessionObject.password;
					delete sessionObject.deviceId;
					req.session.user	=	sessionObject;
					req.session.user.name = req.session.user.ime;
					res.redirect("/");
				}
			})
			.catch((error)=>{
				logError(error);
				res.render("messageNotLoggedIn",{
					pageTitle: "Програмска грешка",
					message: "<div class=\"text\">Greska u bazi podataka 10139</div>"
				});
			})
		}else{
			res.redirect("/");
		}
	}else{
		res.send("Greska u tokenu");
	}
	
})

server.post('/appLogin',async (req,res)=>{
	if(req.session.user){
		res.redirect("/")
	}else{
		try{
			const loginJson = JSON.parse(req.body.json);
			if(loginJson.serverToken==process.env.servertoken){
				const username = loginJson.username;
				const password = hashString(loginJson.password);
				const deviceId = loginJson.deviceId;
				majstoriDB.find({username:username}).toArray()
				.then((majstori)=>{
					if(majstori.length>0){
						if(majstori[0].password==password){
							var sessionObject	=	JSON.parse(JSON.stringify(majstori[0]));
							delete sessionObject.password;
							req.session.user	=	sessionObject;
							req.session.user.role = 60;
							req.session.user.name = req.session.user.ime;
							var setObj	=	{ $set: {
								deviceId: deviceId
							}};
							majstoriDB.updateOne({username:username},setObj)
							.then((dbResponse)=>{
								res.redirect("/")
							})
							.catch((error)=>{
								logError(error);
								res.render("messageNotLoggedIn",{
									pageTitle: "Програмска грешка",
									message: "<div class=\"text\">Дошло је до грешке у бази податка 10196. Молимо затворите апликацију и покрените је поново.</div>"
								});
							})
						}else{
							res.render("messageNotLoggedIn",{
								pageTitle: "Грешка",
								message: "<div class=\"text\">Унели сте погрешну лозинку. Молимо затворите апликацију и покрените је поново.</div>"
							});
						}
					}else{
						res.render("messageNotLoggedIn",{
							pageTitle: "Грешка",
							message: "<div class=\"text\">Не постоји корисник са унетом електронском поштом. Молимо затворите апликацију и покрените је поново.</div>"
						});
					}
				})
				.catch((error)=>{
					logError(error);
					res.render("messageNotLoggedIn",{
						pageTitle: "Програмска грешка",
						message: "<div class=\"text\">Дошло је до грешке у бази податка 2263. Молимо затворите апликацију и покрените је поново.</div>"
					});
				})
			}else{
				res.render("messageNotLoggedIn",{
					pageTitle: "Програмска грешка",
					message: "<div class=\"text\">Грешка у токену. Молимо затворите апликацију и покрените је поново.</div>"
				});
			}
			
		}catch(err){
			logError(err);
			res.render("messageNotLoggedIn",{
				pageTitle: "Програмска грешка",
				message: "<div class=\"text\">Greska u bazi podataka 10171. Молимо затворите апликацију и покрените је поново.</div>"
			});
		}
	}
	
	
});


/*request(ntsOptions, (error,response,body)=>{
	if(error){
		logError(error);
	}else{
		var cookie = response.headers['set-cookie'];
		var headers = {
			'accept': 'application/json',
		  'Cookie': cookie,
		  'Content-Type': 'application/json'
		}
		var options = {
		    url: 'http://app.nts-international.net/ntsapi/allvehiclestate?timezone=UTC&sensors=true&ioin=true',
		    method: 'GET',
		    headers: headers
		};
		request(options, (error,response2,body2)=>{
			if(error){
				logError(error);
			}else{
				var options = {
				    url: 'https://app.nts-international.net/ntsapi/allvehicles',
				    method: 'GET',
				    headers: headers
				};
				request(options, (error,response3,body3)=>{
					if(error){
						logError(error)
					}else{
						try{
							var vehiclesInfo = JSON.parse(response3.body);
							console.log(vehiclesInfo);
							console.log("---------------------------------------------------")
							try{
								var vehicleStates = JSON.parse(response2.body);
								console.log(vehicleStates)
								console.log("---------------------------------------------------")
								
								//socket.emit('lokacijaMajstoraOdgovor',vehicleStates)
							}catch(err){
								logError(err)
								//socket.emit('lokacijaMajstoraOdgovor',[])
							}
						}catch(err){
							logError(err);
						}
					}
				});
			}
		});
	}
})*/


var vozila;

setInterval(function(){
	axios(config)
	.then(async response => {
	  token = response.data.access_token;
	  var json = {};

		var config2 = {
	      url: baseUrl + '/api/Client/GetClient',
	      method: 'POST', // If necessary
	      headers: { 
	          'Content-Type': 'application/json',
	          'Authorization': `Bearer ${token}`
	      },
	      data: { 'ClientId': telematicsId }
	  };

	  //Client data
	  var response = await axios(config2);
	  //console.log(response.data)
	  json.clientInfo = response.data.client[0];

	  
	  var config3 = {
	      url: baseUrl + '/api/Asset/GetDevicesCurrentData',
	      method: 'POST', // If necessary
	      headers: { 
	          'Content-Type': 'application/json',
	          'Authorization': `Bearer ${token}`
	      },
	      data: { 'ClientId': telematicsId }
	  };
	  var response = await axios(config3);
	  json.vozila = response.data;
	  vozila = JSON.parse(JSON.stringify(json))
	  io.emit('lokacijaMajstoraOdgovor',json)
	})
	.catch((error)=>{
		console.log(error)
		io.emit('lokacijaMajstoraOdgovor',"Greska")
	})


	/*request(ntsOptions, (error,response,body)=>{
			if(error){
				logError(error);
			}else{
				//console.log(response.headers['set-cookie']);
				var cookie = response.headers['set-cookie'];
				var headers = {
					'accept': 'application/json',
			    'Cookie': cookie,
			    'Content-Type': 'application/json'
				}
				var options = {
				    url: 'http://app.nts-international.net/ntsapi/allvehiclestate?timezone=UTC&sensors=true&ioin=true',
				    method: 'GET',
				    headers: headers
				};
				request(options, (error,response2,body2)=>{
					if(error){
						logError(error);
					}else{
						var options = {
						    url: 'https://app.nts-international.net/ntsapi/allvehicles',
						    method: 'GET',
						    headers: headers
						};
						request(options, (error,response3,body3)=>{
							if(error){
								logError(error)
							}else{
								try{
									var vehiclesInfo = JSON.parse(response3.body);
									try{
										var vehicleStates = JSON.parse(response2.body);
										io.emit('lokacijaMajstoraOdgovor',vehicleStates,vehiclesInfo)
									}catch(err){
										logError(err)
									}
								}catch(err){
									logError(err);
								}
							}
						});
					}
				});
			}
		});*/
},10000)


io.on('connection', function(socket){

	socket.on('listaNalogaAdministracija', function(odDatuma,doDatuma,adresa,opstine){
		var dbFindStart	=	new Date().getTime();
		naloziDB.find({}).toArray()
		.then((nalozi) => {
			var naloziToSend	=	[];
			if(odDatuma && doDatuma){
				var startTime = new Date(odDatuma).getTime();
				var endTime = new Date(doDatuma).getTime();
				for(var i=0;i<nalozi.length;i++){
					var nalogDate	=	new Date(Number(nalozi[i].uniqueId.split("--")[1]));
					var nalogTime	=	new Date(getDateAsStringForInputObject(nalogDate)).getTime();
					delete nalozi[i]._id;
					delete nalozi[i].uniqueId;
					if(nalogTime>=startTime && nalogTime<=endTime){
						naloziToSend.push(nalozi[i]);
					}
				}
			}else{
				naloziToSend = nalozi;
			}

			

			for(var i=0;i<naloziToSend.length;i++){
				if(opstine.indexOf(naloziToSend[i].radnaJedinica)<0){
					naloziToSend.splice(i,1);
					i--;
				}
			}

			if(adresa){
				for(var i=0;i<naloziToSend.length;i++){
					if(!naloziToSend[i].adresa.toLowerCase().includes(adresa.toString().toLowerCase())){
						naloziToSend.splice(i,1);
						i--
					}
				}
			}


			var statistika	=	{};
			statistika.ukupnoNaloga				=	naloziToSend.length;
			statistika.ukupnoObracnuatih		=	0;
			statistika.ukupanIznos				=	0;
			statistika.ukupnoFakturisanih		=	0;
			statistika.ukupnoFakturisanIznos	=	0;
			statistika.pdvZaNaloge				=	0;
			statistika.ukupnoPodizvodjaca		=	0;
			statistika.ukupanIznosPodizvodjaca	=	0;

			for(var i=0;i<naloziToSend.length;i++){
				var iznosNaloga = isNaN(parseFloat(naloziToSend[i].ukupanIznos)) ? 0 : parseFloat(naloziToSend[i].ukupanIznos);
				if(iznosNaloga>0){
					statistika.ukupnoObracnuatih++;
					statistika.ukupanIznos = statistika.ukupanIznos+iznosNaloga;
				}

				if(naloziToSend[i].statusNaloga=="Fakturisan"){
					statistika.ukupnoFakturisanih++;
					statistika.ukupnoFakturisanIznos = statistika.ukupnoFakturisanIznos + iznosNaloga;
					var pdvZaNalog = iznosNaloga>500000 ? 0 : iznosNaloga*0.2;
					statistika.pdvZaNaloge = statistika.pdvZaNaloge + pdvZaNalog;
				}

				if(podizvodjaci.indexOf(naloziToSend[i].majstor)>=0){
					statistika.ukupnoPodizvodjaca++;
					statistika.ukupanIznosPodizvodjaca = statistika.ukupanIznosPodizvodjaca + iznosNaloga;
				}
			}
			socket.emit('listaNalogaAdministracijaOdgovor',1,statistika,naloziToSend,"Found in " + eval(new Date().getTime()/1000-dbFindStart/1000).toFixed(2)+"s");	
			
		})
		.catch((error)=>{
			logError(error);
			socket.emit('listaNalogaAdministracijaOdgovor',0,{},[],"Greska u pretrazi naloga",error);
		});
	});

	socket.on('listaFakturisanihNaloga', function(startTime,endTime,odBroja,doBroja){
		var dbFindStart	=	new Date().getTime();
		var warnings = [];
		naloziDB.find({statusNaloga:"Fakturisan"}).toArray()
		.then((nalozi) => {
			var naloziToSend	=	[];
			for(var i=0;i<nalozi.length;i++){
				var nalogToPush = {};
				nalogToPush.broj = nalozi[i].broj;
				nalogToPush.faktura = nalozi[i].faktura;
				nalogToPush.radnaJedinica = nalozi[i].radnaJedinica;
				nalogToPush.ukupanIznos = nalozi[i].ukupanIznos;
				nalogToPush.prijemnica = nalozi[i].prijemnica;
				if(startTime!="" && endTime!=""){
					var datetime = nalogToPush.prijemnica.datum.datetime;
					if(datetime>=startTime && datetime<=endTime){
						naloziToSend.push(nalogToPush)
					}
				}else if(odBroja!="" && doBroja!=""){
					if(nalogToPush.samoBroj == 0){
						warnings.push("Nije moguce odrediti broj fakture za nalog "+nalogToPush.broj+", broj fakture"+nalogToPush.brojFakture);
					}else{
						if(Number(nalogToPush.faktura.samoBroj)>=Number(odBroja) && Number(nalogToPush.faktura.samoBroj)<=Number(doBroja)){
							if(nalogToPush.faktura.broj.includes("2025")){
								naloziToSend.push(nalogToPush)	
							}
							
						}
					}
				}else{
					naloziToSend.push(nalogToPush)
				}
			}

			var statistika	=	{};
			statistika.ukupnoNaloga					=	naloziToSend.length;
			statistika.ukupanIznos					=	0;
			statistika.ukupanPdv						=	0;
			statistika.ukupnoPrekoPolaMil		=	0;
			statistika.osnovica							=	0;
			statistika.neoporezivo					=	0;

			statistika.ukupnoNalogaPG					=	naloziToSend.length;
			statistika.ukupanIznosPG					=	0;
			statistika.ukupanPdvPG						=	0;
			statistika.ukupnoPrekoPolaMilPG		=	0;
			statistika.osnovicaPG							=	0;
			statistika.neoporezivoPG					=	0;

			for(var i=0;i<naloziToSend.length;i++){
				if(isNaN(parseFloat(naloziToSend[i].ukupanIznos))){
					warnings.push("Nalog "+ naloziToSend.broj +" nema definisan iznos ("+naloziToSend[i].ukupanIznos+").")
				}
				var iznosNaloga = isNaN(parseFloat(naloziToSend[i].ukupanIznos)) ? 0 : parseFloat(naloziToSend[i].ukupanIznos);
				var iznosNalogaPG = iznosNaloga * 0.675;
				statistika.ukupanIznos = statistika.ukupanIznos + iznosNaloga;
				statistika.ukupanIznosPG = statistika.ukupanIznosPG + iznosNalogaPG;
				if(iznosNaloga>=500000){
					statistika.ukupnoPrekoPolaMil++;
					statistika.neoporezivo	= statistika.neoporezivo + iznosNaloga
				}else{
					statistika.ukupanPdv = statistika.ukupanPdv + iznosNaloga*0.2;
					statistika.osnovica	= statistika.osnovica + iznosNaloga;
				}

				if(iznosNalogaPG>=500000){
					statistika.ukupnoPrekoPolaMilPG++;
					statistika.neoporezivoPG	= statistika.neoporezivoPG + iznosNalogaPG;
				}else{
					statistika.ukupanPdvPG = statistika.ukupanPdvPG + iznosNalogaPG*0.2;
					statistika.osnovicaPG	= statistika.osnovicaPG + iznosNalogaPG;
				}
			}
			naloziToSend = naloziToSend.sort((a, b) => {
				if (a.faktura.samoBroj < b.faktura.samoBroj) {
					return -1;
				}
			});
			socket.emit('listaFakturisanihNalogaOdgovor',1,statistika,naloziToSend,"Found "+naloziToSend.length+" in " + eval(new Date().getTime()/1000-dbFindStart/1000).toFixed(2)+"s",warnings);	
			
		})
		.catch((error)=>{
			logError(error);
			socket.emit('listaFakturisanihNalogaOdgovor',0,{},[],"Greska u pretrazi naloga",error);
		});
	});

	socket.on('listaFakturisanihNalogaPoBroju', function(odBroja,doBroja){
		var dbFindStart	=	new Date().getTime();
		var warnings = [];
		naloziDB.find({statusNaloga:"Fakturisan"}).toArray()
		.then((nalozi) => {
			var naloziToSend	=	[];
			for(var i=0;i<nalozi.length;i++){
				var nalogToPush = {};
				nalogToPush.broj = nalozi[i].broj;
				nalogToPush.faktura = nalozi[i].faktura;
				nalogToPush.radnaJedinica = nalozi[i].radnaJedinica;
				nalogToPush.ukupanIznos = nalozi[i].ukupanIznos;
				nalogToPush.prijemnica = nalozi[i].prijemnica;
				if(nalogToPush.faktura.samoBroj==0 || isNaN(Number(nalogToPush.faktura.samoBroj))){
					warnings.push("Nije moguce odrediti broj fakture za nalog "+nalogToPush.broj+", broj fakture"+nalogToPush.brojFakture);
				}else{
					if(Number(nalogToPush.faktura.samoBroj)>=Number(odBroja) && Number(nalogToPush.faktura.samoBroj)<=Number(doBroja)){
						if(nalogToPush.faktura.broj.includes("/2025")){
							naloziToSend.push(nalogToPush)
						}
						
					}
				}
			}

			var statistika	=	{};
			statistika.ukupnoNaloga					=	naloziToSend.length;
			statistika.ukupanIznos					=	0;
			statistika.ukupanPdv						=	0;
			statistika.ukupnoPrekoPolaMil		=	0;
			statistika.osnovica							=	0;
			statistika.neoporezivo					=	0;

			statistika.ukupnoNalogaPG					=	naloziToSend.length;
			statistika.ukupanIznosPG					=	0;
			statistika.ukupanPdvPG						=	0;
			statistika.ukupnoPrekoPolaMilPG		=	0;
			statistika.osnovicaPG							=	0;
			statistika.neoporezivoPG					=	0;

			for(var i=0;i<naloziToSend.length;i++){
				if(isNaN(parseFloat(naloziToSend[i].ukupanIznos))){
					warnings.push("Nalog "+ naloziToSend.broj +" nema definisan iznos ("+naloziToSend[i].ukupanIznos+").")
				}
				var iznosNaloga = isNaN(parseFloat(naloziToSend[i].ukupanIznos)) ? 0 : parseFloat(naloziToSend[i].ukupanIznos);
				var iznosNalogaPG = iznosNaloga * 0.675;
				statistika.ukupanIznos = statistika.ukupanIznos + iznosNaloga;
				statistika.ukupanIznosPG = statistika.ukupanIznosPG + iznosNalogaPG;
				if(iznosNaloga>=500000){
					statistika.ukupnoPrekoPolaMil++;
					statistika.neoporezivo	= statistika.neoporezivo + iznosNaloga
				}else{
					statistika.ukupanPdv = statistika.ukupanPdv + iznosNaloga*0.2;
					statistika.osnovica	= statistika.osnovica + iznosNaloga;
				}

				if(iznosNalogaPG>=500000){
					statistika.ukupnoPrekoPolaMilPG++;
					statistika.neoporezivoPG	= statistika.neoporezivoPG + iznosNalogaPG;
				}else{
					statistika.ukupanPdvPG = statistika.ukupanPdvPG + iznosNalogaPG*0.2;
					statistika.osnovicaPG	= statistika.osnovicaPG + iznosNalogaPG;
				}
			}
			for(var i=0;i<naloziToSend.length;i++){
				naloziToSend[i].sorting = Number(naloziToSend[i].faktura.samoBroj);
			}
			naloziToSend = naloziToSend.sort((a, b) => {
				if (a.sorting < b.sorting) {
					return -1;
				}
			});
			socket.emit('listaFakturisanihNalogaPoBrojuOdgovor',1,statistika,naloziToSend,"Found "+naloziToSend.length+" in " + eval(new Date().getTime()/1000-dbFindStart/1000).toFixed(2)+"s",warnings);	
			
		})
		.catch((error)=>{
			logError(error);
			socket.emit('listaFakturisanihNalogaOdgovor',0,{},[],"Greska u pretrazi naloga",error);
		});
	});

	socket.on('adresaPoBroju', function(broj){
		naloziDB.find({broj:broj.toString()}).toArray()
		.then((nalozi) => {
			if(nalozi.length>0){
				socket.emit('adresaPoBrojuOdgovor',nalozi[0].adresa)
			}
		})
		.catch((error)=>{
			logError(error)
		})
	})

	socket.on('nalogPoBroju', function(broj,elemId){
		naloziDB.find({broj:broj.toString()}).toArray()
		.then((nalozi) => {
			if(nalozi.length>0){
				socket.emit('nalogPoBrojuOdgovor',nalozi[0],elemId)
			}else{
				socket.emit('nalogPoBrojuOdgovor',"Greska",elemId)
			}
		})
		.catch((error)=>{
			logError(error)
				socket.emit('nalogPoBrojuOdgovor',"Greska",elemId)
		})
	})

	socket.on('lokacijaMajstora', function(broj){
		request(ntsOptions, (error,response,body)=>{
			if(error){
				logError(error)
				socket.emit('lokacijaMajstoraOdgovor',[])
			}else{
				//console.log(response.headers['set-cookie']);
				var cookie = response.headers['set-cookie'];
				var headers = {
					'accept': 'application/json',
			    'Cookie': cookie,
			    'Content-Type': 'application/json'
				}
				var options = {
				    url: 'http://app.nts-international.net/ntsapi/allvehiclestate?timezone=UTC&sensors=true&ioin=true',
				    method: 'GET',
				    headers: headers
				};
				request(options, (error,response2,body2)=>{
					if(error){
						logError(error);
					}else{
						var options = {
						    url: 'https://app.nts-international.net/ntsapi/allvehicles',
						    method: 'GET',
						    headers: headers
						};
						request(options, (error,response3,body3)=>{
							if(error){
								logError(error)
							}else{
								try{
									var vehiclesInfo = JSON.parse(response3.body);
									//console.log(vehiclesInfo);
									try{
										var vehicleStates = JSON.parse(response2.body);
										/*console.log(vehicleStates)
										console.log("---------------------------------------------------")
										console.log(vehiclesInfo)*/
										/*for(var i=0;i<vehicleStates.length;i++){
											for(var j=0;j<vehiclesInfo.length;j++){
												if(vehicleStates[i].vehicleId==vehiclesInfo[j].id){
													vehicleStates[i].licenceplate = vehiclesInfo[j].licenceplate;
												}
											}
										}*/
										/*for(var i=0;i<navigacijaInfo.length;i++){
											for(var j=0;j<vehicleStates.length;j++){
												if(navigacijaInfo[i].idNavigacije==vehicleStates[j].vehicleId){
													vehicleStates[j].imeMajstora = navigacijaInfo[i].imeMajstora;
													vehicleStates[j].nadimakMajstora = navigacijaInfo[i].nadimakMajstora;
													vehicleStates[j].brojTablice = navigacijaInfo[i].brojTablice;
													vehicleStates[j].brojVozila = navigacijaInfo[i].brojVozila;
													vehicleStates[j].tipVozila = navigacijaInfo[i].tipVozila;
													vehicleStates[j].statusVozila = navigacijaInfo[i].status;
												}
											}
										}

										for(var i=0;i<vehicleStates.length;i++){
											if(!vehicleStates[i].statusVozila){
												vehicleStates.splice(i,1);
												i--;
											}
										}*/

										/*for(var i=0;i<vehicleStates.length;i++){
											console.log(vehicleStates[i].statusMajstora)
										}*/
										socket.emit('lokacijaMajstoraOdgovor',vehicleStates)
									}catch(err){
										logError(err)
										socket.emit('lokacijaMajstoraOdgovor',[])
									}
								}catch(err){
									logError(err);
								}
							}
						});
					}
				});
			}
		});
	})

	socket.on('lokacijaWomi', function(broj){
		request(ntsOptions, (error,response,body)=>{
			if(error){
				logError(error)
				socket.emit('lokacijaWomiOdgovor',[])
			}else{
				//console.log(response.headers['set-cookie']);
				var cookie = response.headers['set-cookie'];
				var headers = {
					'accept': 'application/json',
			    'Cookie': cookie,
			    'Content-Type': 'application/json'
				}
				var options = {
				    url: 'http://app.nts-international.net/ntsapi/allvehiclestate?timezone=UTC&sensors=true&ioin=true',
				    method: 'GET',
				    headers: headers
				};
				request(options, (error,response2,body2)=>{
					if(error){
						logError(error);
					}else{
						var options = {
						    url: 'https://app.nts-international.net/ntsapi/allvehicles',
						    method: 'GET',
						    headers: headers
						};
						request(options, (error,response3,body3)=>{
							if(error){
								logError(error)
							}else{
								try{
									var vehiclesInfo = JSON.parse(response3.body);
									//console.log(vehiclesInfo);
									try{
										var vehicleStates = JSON.parse(response2.body);
										/*console.log(vehicleStates)
										console.log("---------------------------------------------------")
										console.log(vehiclesInfo)*/
										/*for(var i=0;i<vehicleStates.length;i++){
											for(var j=0;j<vehiclesInfo.length;j++){
												if(vehicleStates[i].vehicleId==vehiclesInfo[j].id){
													vehicleStates[i].licenceplate = vehiclesInfo[j].licenceplate;
												}
											}
										}*/
										for(var i=0;i<navigacijaInfo.length;i++){
											for(var j=0;j<vehicleStates.length;j++){
												if(navigacijaInfo[i].idNavigacije==vehicleStates[j].vehicleId){
													vehicleStates[j].imeMajstora = navigacijaInfo[i].imeMajstora;
													vehicleStates[j].nadimakMajstora = navigacijaInfo[i].nadimakMajstora;
													vehicleStates[j].brojTablice = navigacijaInfo[i].brojTablice;
													vehicleStates[j].brojVozila = navigacijaInfo[i].brojVozila;
													vehicleStates[j].tipVozila = navigacijaInfo[i].tipVozila;
													vehicleStates[j].statusVozila = navigacijaInfo[i].status;
												}
											}
										}

										for(var i=0;i<vehicleStates.length;i++){
											if(!vehicleStates[i].statusVozila){
												vehicleStates.splice(i,1);
												i--;
											}
										}

										for(var i=0;i<vehicleStates.length;i++){
											if(vehicleStates[i].tipVozila==""){
												vehicleStates.splice(i,1);
												i--;
											}
										}

										/*for(var i=0;i<vehicleStates.length;i++){
											console.log(vehicleStates[i].statusMajstora)
										}*/
										socket.emit('lokacijaWomiOdgovor',vehicleStates)
									}catch(err){
										logError(err)
										socket.emit('lokacijaWomiOdgovor',[])
									}
								}catch(err){
									logError(err);
								}
							}
						});



						
					}
				});
			}
		});
	})


	socket.on('stopoviMajstora', function(broj){










		request(ntsOptions, (error,response,body)=>{
			if(error){
				logError(error)
			}else{
				//console.log(response.headers['set-cookie']);
				var cookie = response.headers['set-cookie'];
				var headers = {
					'accept': 'application/json',
			    'Cookie': cookie,
			    'Content-Type': 'application/json'
				}
				var allVehicleStops = [];
				navigacijaInfo.forEach((value, index) =>{
					var options = {
					    url: 'https://app.nts-international.net/ntsapi/stops?vehicle='+value.idNavigacije+'&from='+getDateAsStringForInputObject(new Date())+' 00:00:00&to='+getDateAsStringForInputObject(new Date())+' 23:59:00&timzeone=UTC&version=2.3',
					    method: 'GET',
					    headers: headers
					};
					request(options, (error,response3,body3)=>{
						if(error){
							logError(error)
						}else{
							var stops = JSON.parse(response3.body)
							allVehicleStops.push(stops);

						}
					});		
				});
				var today = new Date();
				//today.setDate(today.getDate()-1);
				dodeljivaniNaloziDB.find({"datum.datum":getDateAsStringForDisplay(today)}).toArray()
				.then((dodeljivaniNalozi)=>{
					naloziDB.find({statusNaloga:{$nin:["Završeno","Nalog u Stambenom","Spreman za fakturisanje","Fakturisan","Storniran"]}}).toArray()
					.then((nedodeljeniNalozi)=>{
						for(var i=0;i<nedodeljeniNalozi.length;i++){
							for(var j=0;j<dodeljivaniNalozi.length;j++){
								if(dodeljivaniNalozi[j].nalog == nedodeljeniNalozi[i].broj){
									nedodeljeniNalozi.splice(i,1);
									i--;
								}
							}
						}
						setTimeout(function(){
							socket.emit("stopoviMajstoraOdgovor",allVehicleStops,navigacijaInfo,dodeljivaniNalozi,nedodeljeniNalozi)
						},2000)
					})
					.catch((error)=>{
						logError(error);
					})
					
				})
				.catch((error)=>{
					logError(error);
				})
				
				
			}
		});
	})


	socket.on('lokacijaTv3', function(broj){
		request(ntsOptions, (error,response,body)=>{
			if(error){
				console.log(error);
				socket.emit("lokacijaTv3Response",{type:-1,json:error.toString()})
			}else{
				var cookie = response.headers['set-cookie'];
				var headers = {
					'accept': 'application/json',
			    'Cookie': cookie,
			    'Content-Type': 'application/json'
				}
				var options = {
				    url: 'https://app.nts-international.net/ntsapi/allvehiclestate',
				    method: 'GET',
				    headers: headers
				};
				request(options, (error,response2,body2)=>{
					if(error){
						console.log(error)
						socket.emit("lokacijaTv3Response",{type:-1,json:error.toString()})
					}else{
						try{
							var responseJson = JSON.parse(response2.body);
							socket.emit("lokacijaTv3Response",{type:1,json:responseJson})
						}catch(error){
							console.log(error);
							socket.emit("lokacijaTv3Response",{type:-1,json:error.toString()})
						}

					}
				});
			}
		});
	})

	socket.on('administracija2', function(dummy){
		var json = {};
		json.beogradUgovorNaloziUkupno 					=	0;
		json.beogradUgovorNaloziDodeljeni 			=	0;
		json.beogradUgovorNaloziVraceni 				=	0;
		json.beogradUgovorNaloziIzvrseno 				=	0;
		json.beogradUgovorNaloziValidirano 			=	0;
		json.beogradUgovorNaloziNaOdobrenju 		=	0;
		json.beogradUgovorNaloziStornirano 			=	0;
		

		json.beogradUgovorFinansijeUkupno 			=	0;
		json.beogradUgovorFinansijeFakturisano 	=	0;
		json.beogradUgovorFinansijeValidirano 	=	0;
		json.beogradUgovorFinansijeNaOdobrenju 	=	0;
		json.beogradUgovorFinansijeVraceno		 	=	0;
		json.beogradUgovorFinansijeOdbijeno		 	=	0;


		json.beogradOvajMesecNaloziUkupno 				=	0;
		json.beogradOvajMesecNaloziDodeljeni 			=	0;
		json.beogradOvajMesecNaloziVraceni 				=	0;
		json.beogradOvajMesecNaloziIzvrseno 			=	0;
		json.beogradOvajMesecNaloziValidirano 		=	0;
		json.beogradOvajMesecNaloziNaOdobrenju 		=	0;
		json.beogradOvajMesecNaloziStornirano 		=	0;

		json.beogradOvajMesecFinansijeUkupno 			=	0;
		json.beogradOvajMesecFinansijeFakturisano =	0;
		json.beogradOvajMesecFinansijeValidirano 	=	0;
		json.beogradOvajMesecFinansijeNaOdobrenju =	0;
		json.beogradOvajMesecFinansijeVraceno		 	=	0;
		json.beogradOvajMesecFinansijeOdbijeno		=	0;


		json.beogradPrethodniMesecNaloziUkupno 			=	0;
		json.beogradPrethodniMesecNaloziStornirano 	=	0;

		json.beogradOvajMesecFinansijeUkupno 			=	0;
		json.beogradOvajMesecFinansijeFakturisano =	0;
		json.beogradOvajMesecFinansijeOdbijeno		=	0;


		json.istokOvajMesecNaloziUkupno 				=	0;
		json.istokOvajMesecNaloziDodeljeni 			=	0;
		json.istokOvajMesecNaloziVraceni 				=	0;
		json.istokOvajMesecNaloziIzvrseno 			=	0;
		json.istokOvajMesecNaloziValidirano 		=	0;
		json.istokOvajMesecNaloziNaOdobrenju 		=	0;
		json.istokOvajMesecNaloziStornirano 		=	0;

		json.istokOvajMesecFinansijeUkupno 			=	0;
		json.istokOvajMesecFinansijeFakturisano =	0;
		json.istokOvajMesecFinansijeValidirano 	=	0;
		json.istokOvajMesecFinansijeNaOdobrenju =	0;
		json.istokOvajMesecFinansijeVraceno		 	=	0;
		json.istokOvajMesecFinansijeOdbijeno		=	0;


		json.istokPrethodniMesecNaloziUkupno 			=	0;
		json.istokPrethodniMesecNaloziStornirano 	=	0;

		json.istokOvajMesecFinansijeUkupno 			=	0;
		json.istokOvajMesecFinansijeFakturisano =	0;
		json.istokOvajMesecFinansijeOdbijeno		=	0;






		json.zapadOvajMesecNaloziUkupno 				=	0;
		json.zapadOvajMesecNaloziDodeljeni 			=	0;
		json.zapadOvajMesecNaloziVraceni 				=	0;
		json.zapadOvajMesecNaloziIzvrseno 			=	0;
		json.zapadOvajMesecNaloziValidirano 		=	0;
		json.zapadOvajMesecNaloziNaOdobrenju 		=	0;
		json.zapadOvajMesecNaloziStornirano 		=	0;

		json.zapadOvajMesecFinansijeUkupno 			=	0;
		json.zapadOvajMesecFinansijeFakturisano =	0;
		json.zapadOvajMesecFinansijeValidirano 	=	0;
		json.zapadOvajMesecFinansijeNaOdobrenju =	0;
		json.zapadOvajMesecFinansijeVraceno		 	=	0;
		json.zapadOvajMesecFinansijeOdbijeno		=	0;


		json.zapadPrethodniMesecNaloziUkupno 			=	0;
		json.zapadPrethodniMesecNaloziStornirano 	=	0;

		json.zapadOvajMesecFinansijeUkupno 			=	0;
		json.zapadOvajMesecFinansijeFakturisano =	0;
		json.zapadOvajMesecFinansijeOdbijeno		=	0;
		var mesec = eval(new Date().getMonth()+1).toString().padStart("0",2);
		var prethodniMesec = eval(new Date().getMonth()).toString().padStart("0",2);
		var godina = new Date().getFullYear();

		naloziDB.find({}).toArray()
		.then((nalozi)=>{
			var brojeviNaloga = [];
			for(var i=0;i<nalozi.length;i++){
				if(brojeviNaloga.indexOf(Number(nalozi[i].broj))<0){
					brojeviNaloga.push(Number(nalozi[i].broj))
				}
			}
			console.log("Ukupno naloga: "+brojeviNaloga.length)
			portalStambenoTestDB.find({broj_naloga:{$in:brojeviNaloga}}).toArray()
			.then((ispravke)=>{
				console.log("Ukupno ispravki: "+ispravke.length)
				for(var i=0;i<nalozi.length;i++){
					nalozi[i].ispravke = [];
					for(var j=0;j<ispravke.length;j++){
						if(Number(nalozi[i].broj)==ispravke[j].broj_naloga){
							nalozi[i].ispravke.push(ispravke[j])
						}
					}

					nalozi[i].maxIznos = nalozi[i].ukupanIznos ? parseFloat(nalozi[i].ukupanIznos) : 0;
					for(var j=0;j<nalozi[i].ispravke.length;j++){
						var iznos = 0;
						for(var k=0;k<nalozi[i].ispravke[j].order_lines.length;k++){
							iznos = iznos + parseFloat(nalozi[i].ispravke[j].order_lines[k].ukupna_cena_dobavljaca)
						}
						if(nalozi[i].maxIznos<iznos){
							nalozi[i].maxIznos = parseFloat(iznos)
						}
					}

					json.beogradUgovorNaloziUkupno++;
					json.beogradUgovorFinansijeUkupno = json.beogradUgovorFinansijeUkupno + parseFloat(nalozi[i].ukupanIznos);
					if(["Završeno","Spreman za fakturisanje","Nalog u Stambenom","Fakturisan","Storniran"].indexOf(nalozi[i].statusNaloga)<0){
						json.beogradUgovorNaloziDodeljeni++;
					}

					if(nalozi[i].statusNaloga=="Vraćen"){
						json.beogradUgovorNaloziVraceni++;
					}

					if(["Završeno","Spreman za fakturisanje","Nalog u Stambenom"].indexOf(nalozi[i].statusNaloga)>=0){
						json.beogradUgovorNaloziIzvrseno++;
					}

					if(nalozi[i].statusNaloga=="Spreman za fakturisanje"){
						json.beogradUgovorNaloziValidirano++;
						json.beogradUgovorFinansijeValidirano = json.beogradUgovorFinansijeValidirano + parseFloat(nalozi[i].ukupanIznos);
					}

					if(nalozi[i].statusNaloga=="Nalog u Stambenom"){
						json.beogradUgovorNaloziNaOdobrenju++;
						json.beogradUgovorFinansijeNaOdobrenju = json.beogradUgovorFinansijeNaOdobrenju + parseFloat(nalozi[i].ukupanIznos);
					}

					if(nalozi[i].statusNaloga=="Storniran"){
						json.beogradUgovorNaloziStornirano++;
					}

					if(nalozi[i].statusNaloga=="Fakturisan"){
						json.beogradUgovorFinansijeFakturisano = json.beogradUgovorFinansijeFakturisano + parseFloat(nalozi[i].ukupanIznos);
						json.beogradUgovorFinansijeOdbijeno = json.beogradUgovorFinansijeOdbijeno + parseFloat(nalozi[i].maxIznos) - parseFloat(nalozi[i].ukupanIznos);
					}

					if(nalozi[i].statusNaloga=="Vraćen"){
						json.beogradUgovorFinansijeVraceno = json.beogradUgovorFinansijeVraceno + parseFloat(nalozi[i].ukupanIznos);
						json.beogradOvajMesecFinansijeVraceno = json.beogradOvajMesecFinansijeVraceno + parseFloat(nalozi[i].ukupanIznos);
						if(istok.indexOf(nalozi[i].radnaJedinica)>=0){
							json.istokOvajMesecNaloziVraceno++;
						}else if(zapad.indexOf(nalozi[i].radnaJedinica)>=0){
							json.zapadOvajMesecNaloziVraceno++;
						}

						json.beogradOvajMesecNaloziVraceni++;
						if(istok.indexOf(nalozi[i].radnaJedinica)>=0){
							json.istokOvajMesecNaloziVraceni++;
						}else if(zapad.indexOf(nalozi[i].radnaJedinica)>=0){
							json.zapadOvajMesecNaloziVraceni++;
						}

						if(["Završeno","Spreman za fakturisanje","Nalog u Stambenom","Fakturisan","Storniran"].indexOf(nalozi[i].statusNaloga)<0){
							json.beogradOvajMesecNaloziDodeljeni++;
							if(istok.indexOf(nalozi[i].radnaJedinica)>=0){
								json.istokOvajMesecNaloziDodeljeni++;
							}else if(zapad.indexOf(nalozi[i].radnaJedinica)>=0){
								json.zapadOvajMesecNaloziDodeljeni++;
							}
						}

						if(["Završeno","Spreman za fakturisanje","Nalog u Stambenom"].indexOf(nalozi[i].statusNaloga)>=0){
							json.beogradOvajMesecNaloziIzvrseno++;
							if(istok.indexOf(nalozi[i].radnaJedinica)>=0){
								json.istokOvajMesecNaloziIzvrseno++;
							}else if(zapad.indexOf(nalozi[i].radnaJedinica)>=0){
								json.zapadOvajMesecNaloziIzvrseno++;
							}
						}

						json.beogradOvajMesecNaloziUkupno++;
						json.beogradOvajMesecFinansijeUkupno = json.beogradOvajMesecFinansijeUkupno + parseFloat(nalozi[i].ukupanIznos);
						if(istok.indexOf(nalozi[i].radnaJedinica)>=0){
							json.istokOvajMesecNaloziUkupno++;
							json.istokOvajMesecFinansijeUkupno = json.istokOvajMesecFinansijeUkupno + parseFloat(nalozi[i].ukupanIznos);
						}else if(zapad.indexOf(nalozi[i].radnaJedinica)>=0){
							json.zapadOvajMesecNaloziUkupno++;
							json.zapadOvajMesecFinansijeUkupno = json.zapadOvajMesecFinansijeUkupno + parseFloat(nalozi[i].ukupanIznos);
						}

						if(nalozi[i].statusNaloga=="Spreman za fakturisanje"){
							json.beogradOvajMesecNaloziValidirano++;
							json.beogradOvajMesecFinansijeValidirano = json.beogradOvajMesecFinansijeValidirano + parseFloat(nalozi[i].ukupanIznos);
							if(istok.indexOf(nalozi[i].radnaJedinica)>=0){
								json.istokOvajMesecNaloziValidirano++;
								json.istokOvajMesecFinansijeValidirano = json.istokOvajMesecFinansijeValidirano + parseFloat(nalozi[i].ukupanIznos);
							}else if(zapad.indexOf(nalozi[i].radnaJedinica)>=0){
								json.zapadOvajMesecNaloziValidirano++;
								json.zapadOvajMesecFinansijeValidirano = json.zapadOvajMesecFinansijeValidirano + parseFloat(nalozi[i].ukupanIznos);
							}
						}

						if(nalozi[i].statusNaloga=="Nalog u Stambenom"){
							json.beogradOvajMesecNaloziNaOdobrenju++;
							json.beogradOvajMesecFinansijeNaOdobrenju = json.beogradOvajMesecFinansijeNaOdobrenju + parseFloat(nalozi[i].ukupanIznos);
							if(istok.indexOf(nalozi[i].radnaJedinica)>=0){
								json.istokOvajMesecNaloziNaOdobrenju++;
								json.istokOvajMesecFinansijeNaOdobrenju = json.istokOvajMesecFinansijeNaOdobrenju + parseFloat(nalozi[i].ukupanIznos);
							}else if(zapad.indexOf(nalozi[i].radnaJedinica)>=0){
								json.zapadOvajMesecNaloziNaOdobrenju++;
								json.zapadOvajMesecFinansijeNaOdobrenju = json.zapadOvajMesecFinansijeNaOdobrenju + parseFloat(nalozi[i].ukupanIznos);
							}
						}

						if(nalozi[i].statusNaloga=="Fakturisan"){
							
						}
					}




					if(nalozi[i].prijemnica.datum.datum.includes(mesec+"."+godina)){
						

						

						
					}

					if(nalozi[i].datum.datum.includes(mesec+"."+godina)){
						json.beogradOvajMesecNaloziStornirano++;
						if(istok.indexOf(nalozi[i].radnaJedinica)>=0){
							json.istokOvajMesecNaloziStornirano++;
						}else if(zapad.indexOf(nalozi[i].radnaJedinica)>=0){
							json.zapadOvajMesecNaloziStornirano++;
						}

					}


					if(nalozi[i].prijemnica.datum.datum.includes(prethodniMesec+"."+godina)){
						json.beogradPrethodniMesecNaloziUkupno++;
						json.beogradPrethodniMesecFinansijeUkupno = json.beogradPrethodniMesecFinansijeUkupno + parseFloat(nalozi[i].ukupanIznos);
						if(istok.indexOf(nalozi[i].radnaJedinica)>=0){
							json.istokPrethodniMesecNaloziUkupno++;
							json.istokPrethodniMesecFinansijeUkupno = json.istokPrethodniMesecFinansijeUkupno + parseFloat(nalozi[i].ukupanIznos);
						}else if(zapad.indexOf(nalozi[i].radnaJedinica)>=0){
							json.zapadPrethodniMesecNaloziUkupno++;
							json.zapadPrethodniMesecFinansijeUkupno = json.zapadPrethodniMesecFinansijeUkupno + parseFloat(nalozi[i].ukupanIznos);
						}
						if(nalozi[i].statusNaloga=="Fakturisan"){
							json.beogradPrethodniMesecFinansijeFakturisano = json.beogradPrethodniMesecFinansijeFakturisano + parseFloat(nalozi[i].ukupanIznos);
							json.beogradPrethodniMesecFinansijeOdbijeno = json.beogradPrethodniMesecFinansijeOdbijeno + parseFloat(nalozi[i].maxIznos) - parseFloat(nalozi[i].ukupanIznos);
							if(istok.indexOf(nalozi[i].radnaJedinica)>=0){
								json.istokPrethodniMesecFinansijeFakturisano = json.istokPrethodniMesecFinansijeFakturisano + parseFloat(nalozi[i].ukupanIznos);
								json.istokPrethodniMesecFinansijeOdbijeno = json.istokPrethodniMesecFinansijeOdbijeno + parseFloat(nalozi[i].maxIznos) - parseFloat(nalozi[i].ukupanIznos);
							}else if(zapad.indexOf(nalozi[i].radnaJedinica)>=0){
								json.zapadPrethodniMesecFinansijeFakturisano = json.zapadPrethodniMesecFinansijeFakturisano + parseFloat(nalozi[i].ukupanIznos);
								json.zapadPrethodniMesecFinansijeOdbijeno = json.zapadPrethodniMesecFinansijeOdbijeno + parseFloat(nalozi[i].maxIznos) - parseFloat(nalozi[i].ukupanIznos);
							}
						}
					}

					if(nalozi[i].datum.datum.includes(prethodniMesec+"."+godina)){
						json.beogradPrethodniMesecNaloziStornirano++;
						if(istok.indexOf(nalozi[i].radnaJedinica)>=0){
							json.istokPrethodniMesecNaloziStornirano++;
						}else if(zapad.indexOf(nalozi[i].radnaJedinica)>=0){
							json.zapadPrethodniMesecNaloziStornirano++;
						}
					}
				}
				console.log("FINISHED!!!")
				io.emit("administracija2Odgovor",json)

			})
			.catch((error)=>{
				console.log(error);
				io.emit("administracija2Odgovor","error")
			})


		})
		.catch((error)=>{
			console.log(error);
			io.emit("administracija2Odgovor","error")
		})
	})

});



process.on('SIGINT', function(){
	client.close();
	console.log("Database Closed [SIGINT]");
	process.exit();
});
process.on('SIGTERM', function(){
	client.close();
	console.log("Database Closed [SIGTERM]");
	process.exit();
});
process.on('exit', function(){
	client.close();
	console.log("Database Closed [EXIT]");
	process.exit();
});

process.on('uncaughtException', function (exception) {
  	logError(exception);
  	client.close();
	console.log("Database Closed [EXIT]");
	process.exit();
});


