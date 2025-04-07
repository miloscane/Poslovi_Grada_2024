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
const io									=	require('socket.io')(http);
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
var podizvodjaci  = ["SeHQZ--1672650353244","IIwY4--1672650358507","e3MHS--1675759749849","eupy8--1676039178890","S5mdP--1677669290493","0ztkS--1672041761145","ylSnq--1672041756318"];
var radneJedinice = ["NOVI BEOGRAD","ZEMUN","ČUKARICA","SAVSKI VENAC","VRAČAR","RAKOVICA","ZVEZDARA","VOŽDOVAC","STARI GRAD","PALILULA"];
var meseciJson    = [{name:"Februar 2024",string:"02.2024"},{name:"Mart 2024",string:"03.2024"},{name:"April 2024",string:"04.2024"},{name:"Maj 2024",string:"05.2024"},{name:"Jun 2024",string:"06.2024"},{name:"Jul 2024",string:"07.2024"},{name:"Avgust 2024",string:"08.2024"},{name:"Septembar 2024",string:"09.2024"},{name:"Oktobar 2024",string:"10.2024"},{name:"Novembar 2024",string:"11.2024"},{name:"Decembar 2024",string:"12.2024"},{name:"Januar 2025",string:"01.2025"},{name:"Februar 2025",string:"02.2025"},{name:"Mart 2025",string:"03.2025"},{name:"April 2024",string:"04.2025"}]
var daniUNedelji 	=	["Недеља","Понедељак","Уторак","Среда","Четвртак","Петак","Субота"]
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
	errorJSON.date = new Date().getFullYear()+"."+eval(new Date().getMonth()+1)+"."+new Date().getDate();
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

var navigacijaInfo = [];
var cenovnik;
var cenovnikHigh;
var cenovnikLow;
var usersDB;
var naloziDB;
var istorijaNalogaDB;
var majstoriDB;
var izvestajiDB;
var pricesDB;
var pricesHighDB;
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
var stariCenovnikJsons = [];

http.listen(process.env.PORT, function(){
	console.log("Poslovi Grada 2024");
	console.log("Server Started v1.4");
	console.log("Timezone offset: "+new Date().getTimezoneOffset())
	console.log("----------------------------------")
	console.log("Connecting to database....");
	var dbConnectionStart	=	new Date().getTime();
	client.connect()
	.then(() => {
		console.log("Connected to database in " + eval(new Date().getTime()/1000-dbConnectionStart/1000).toFixed(2)+"s")
		usersDB								=	client.db("Poslovi_Grada_2024").collection('Users');
		naloziDB							=	client.db("Poslovi_Grada_2024").collection('Nalozi');
		istorijaNalogaDB			=	client.db("Poslovi_Grada_2024").collection('istorijaNaloga');
		majstoriDB						=	client.db("Poslovi_Grada_2024").collection('Majstori');
		izvestajiDB						=	client.db("Poslovi_Grada_2024").collection('Izvestaji');
		pricesDB							=	client.db("Poslovi_Grada_2024").collection('Cenovnik');
		pricesHighDB					=	client.db("Poslovi_Grada_2024").collection('CenovnikHigh');
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
		opomeneDB								=	client.db("Poslovi_Grada_2024").collection('Opomene');


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


		navigacijaInfoDB.find({}).toArray()
		.then((info)=>{
			for(var i=0;i<info.length;i++){
				if(Number(info[i].status)==1){
					navigacijaInfo.push(info[i])
				}
			}
			console.log("Navigacija inicijalizovana");
		})
		.catch((error)=>{
			console.log(error)
		})
		

		

		pricesDB.find({}).toArray()
		.then((prices)=>{
			for(var i=0;i<prices.length;i++){
				delete prices[i]._id;
			}
			cenovnik = prices;
			console.log("Cenovnik inicijalizovan");

		})
		.catch((error)=>{
			logError(error);
		});

		stariCenovnikDB.find({}).toArray()
		.then((prices)=>{
			for(var i=0;i<prices.length;i++){
				delete prices[i]._id;
			}
			stariCenovnik = prices;
		})
		.catch((error)=>{
			logError(error);
		});

		pricesHighDB.find({}).toArray()
		.then((prices)=>{
			for(var i=0;i<prices.length;i++){
				delete prices[i]._id;
			}
			cenovnikHigh = prices;
			console.log("Cenovnik visokih podizvodjaca inicijalizovan");
		})
		.catch((error)=>{
			logError(error);
		});

		pricesLowDB.find({}).toArray()
		.then((prices)=>{
			for(var i=0;i<prices.length;i++){
				delete prices[i]._id;
			}
			cenovnikLow = prices;
			console.log("Cenovnik niskih podizvodjaca inicijalizovan");
		})
		.catch((error)=>{
			logError(error);
		});

		

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

		/*naloziDB.find({}).toArray()
		.then((nalozi)=>{
			var naloziToExport = [];
			var month = 3;
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
			var dateStart = new Date("2025-02-20");
			var dateEnd = new Date("2025-03-03");
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

				/*naloziDB.find({"datum.datum":{$regex:"02.2025"}}).toArray()
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
				.catch((error)=>{
					console.log(error)
				})*/








	})
	.catch(error => {
		console.log(error)
		console.log('Failed to connect to database');
		logError(error);
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


schedule.scheduleJob('59 23 * * *', sendEmail);


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
			res.redirect("/majstor/mesec/"+eval(new Date().getMonth()+1).toString().padStart(2,"0")+"."+new Date().getFullYear())
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
				informacije.nezavrseno = 0;
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
			var today = new Date();
			//"datum.datum":{$regex:eval(today.getMonth()+1).toString().padStart(2,"0")+"."+today.getFullYear()}
			naloziDB.find({statusNaloga:{$nin:["Završeno","Storniran","Spreman za fakturisanje","Fakturisan","Vraćen"]},radnaJedinica:{$in:req.session.user.radneJedinice}}).toArray()
			.then((nalozi)=>{
				for(var i=0;i<nalozi.length;i++){
					if(podizvodjaci.indexOf(nalozi[i].majstor)>=0){
						nalozi.splice(i,1);
						i--;
					}
				}

				//ovo ispod nalazis samo zbog obracuna
				naloziDB.find({statusNaloga:{$nin:["Storniran","Vraćen"]},"datum.datum":{$regex:eval(today.getMonth()+1).toString().padStart(2,"0")+"."+today.getFullYear()},radnaJedinica:{$in:req.session.user.radneJedinice}}).toArray()
				.then((nalozi2)=>{
					for(var i=0;i<nalozi2.length;i++){
						if(podizvodjaci.indexOf(nalozi2[i].majstor)>=0){
							nalozi2.splice(i,1);
							i--;
						}
					}

					for(var i=0;i<nalozi2.length;i++){
						var nalogExists = false;
						for(var j=0;j<nalozi.length;j++){
							if(nalozi[j].broj==nalozi2[i].broj){
								nalogExists = true;
								break;
							}
						}
						if(!nalogExists){
							nalozi.push(nalozi2[i])
						}
					}

					res.render("kontrola/neizvrseniNalozi",{
						pageTitle:"Неизвршени налози на дан "+getDateAsStringForDisplay(today),
						nalozi: nalozi,
						user: req.session.user
					});
				})
				.catch((error)=>{
					console.log(error);
					res.render("message",{
						pageTitle: "Грешка",
						user: req.session.user,
						message: "<div class=\"text\">Грешка у бази података 2347.</div>"
					});
				})

				
			})
			.catch((error)=>{
				console.log(error)
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
			naloziDB.find({statusNaloga:"Spreman za fakturisanje"}).toArray()
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
					delete nalozi[i].prijemnica;
				}
				res.render("administracija/spremniNalozi",{
					pageTitle:Number(req.session.user.role)==10 ? "Спремни за фактурисање" : "Спремни налози",
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
			dodeljivaniNaloziDB.find({majstor:idMajstora,datumRadova:date}).toArray()
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
												vozilo: Number(navigacijaInfo[i].idNavigacije),
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
			specifikacijePodizvodjacaDB.find({}).toArray()
			.then((specifikacije)=>{
				var naloziToFind = [];
				for(var i=0;i<specifikacije.length;i++){
					for(var j=0;j<specifikacije[i].nalozi.length;j++){
						naloziToFind.push(specifikacije[i].nalozi[j].broj)
					}
				}
				naloziDB.find({broj:{$in:naloziToFind}}).toArray()
				.then((nalozi)=>{
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
				})
				.catch((error)=>{
					logError(error);
					res.render("message",{
						pageTitle: "Грешка",
						message: "<div class=\"text\">Дошло је до грешке у бази податка 2482.</div>",
						user: req.session.user
					});
				})
			})
			.catch((error)=>{
				logError(error);
				res.render("message",{
					pageTitle: "Грешка",
					message: "<div class=\"text\">Дошло је до грешке у бази податка 2085.</div>",
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
		res.redirect("/login?url="+encodeURIComponent(req.url));
	}
});

server.get('/administracija/specifikacijaPodizvodjaca/:uniqueId',async (req,res)=>{
	if(req.session.user){
		if(Number(req.session.user.role)==10){
			specifikacijePodizvodjacaDB.find({uniqueId:req.params.uniqueId}).toArray()
			.then((specifikacije)=>{
				var naloziToFind = [];
				for(var i=0;i<specifikacije[0].nalozi.length;i++){
					naloziToFind.push(specifikacije[0].nalozi[i].broj)
				}
				naloziDB.find({broj:{$in:naloziToFind}}).toArray()
				.then((nalozi)=>{
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
				})
				.catch((error)=>{
					logError(error);
					res.render("message",{
						pageTitle: "Грешка",
						message: "<div class=\"text\">Дошло је до грешке у бази податка 2332.</div>",
						user: req.session.user
					});
				})
			})
			.catch((error)=>{
				logError(error);
				res.render("message",{
					pageTitle: "Грешка",
					message: "<div class=\"text\">Дошло је до грешке у бази податка 2085.</div>",
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
			naloziDB.find({broj:req.params.broj.toString()}).toArray()
			.then((nalozi) => {
				if(nalozi.length>0){
					majstoriDB.find({}).toArray()
					.then((majstori)=>{
						for(var i=0;i<majstori.length;i++){
							if(!majstori[i].aktivan){
								if(podizvodjaci.indexOf(majstori[i].uniqueId)<0){
									majstori.splice(i,1);
									i--;
								}
							}
						}
						istorijaNalogaDB.find({broj:req.params.broj.toString()}).toArray()
						.then((istorijat)=>{
							izvestajiDB.find({nalog:req.params.broj.toString()}).toArray()
							.then((izvestaji)=>{
								ucinakMajstoraDB.find({brojNaloga:req.params.broj.toString()}).toArray()
								.then((ucinci)=>{
									if(Number(req.session.user.role)==10){
										var podizvodjac = 0;
										var cenovnikPodizvodjaca = [];
										if(podizvodjaci.indexOf(nalozi[0].majstor)>=0){
											podizvodjac = 1;
											if(nalozi[0].majstor=="SeHQZ--1672650353244" || nalozi[0].majstor=="IIwY4--1672650358507"){
												cenovnikPodizvodjaca = cenovnikHigh;
											}else{
												cenovnikPodizvodjaca = cenovnikLow;
											}
											for(var i=0;i<cenovnik.length;i++){
												for(var j=0;j<cenovnikPodizvodjaca.length;j++){
													if(cenovnik[i].code==cenovnikPodizvodjaca[j].code){
														cenovnik[i].podizvodjacPrice = cenovnikPodizvodjaca[j].price;
														break;
													}
												}
											}
										}
										
										dodeljivaniNaloziDB.find({nalog:req.params.broj}).toArray()
										.then((dodele)=>{
											magacinReversiDB.find({nalog:req.params.broj}).toArray()
											.then((reversi)=>{
												proizvodiDB.find({}).toArray()
												.then((proizvodi)=>{
													res.render("administracija/nalog",{
														pageTitle:"Налог број " + req.params.broj,
														nalog: nalozi[0],
														majstori: majstori,
														cenovnik: cenovnik,
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
												})
												.catch((error)=>{
													logError(error);
													res.render("message",{
														pageTitle: "Грешка",
														message: "<div class=\"text\">Дошло је до грешке у бази податка 3376.</div>",
														user: req.session.user
													});
												})
												
											})
											.catch((error)=>{
												logError(error);
												res.render("message",{
													pageTitle: "Грешка",
													message: "<div class=\"text\">Дошло је до грешке у бази податка 3376.</div>",
													user: req.session.user
												});
											})
											
										})
										.catch((error)=>{
											logError(error);
											res.render("message",{
												pageTitle: "Грешка",
												message: "<div class=\"text\">Дошло је до грешке у бази податка 3376.</div>",
												user: req.session.user
											});
										})
										
									}else if(Number(req.session.user.role)==20){
										dodeljivaniNaloziDB.find({nalog:req.params.broj}).toArray()
										.then((dodele)=>{
											
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
											/*request(ntsOptions, (error,response,body)=>{
												if(error){
													logError(error);
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
														}else{
															var options = {
															    url: 'https://app.nts-international.net/ntsapi/allvehicles',
															    method: 'GET',
															    headers: headers
															};
															request(options, (error,response3,body3)=>{
																if(error){
																	logError(error)
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
																}else{
																	try{
																		var vehiclesInfo = JSON.parse(response3.body);
																		try{
																			var vehicleStates = JSON.parse(response2.body);

																			for(var i=0;i<navigacijaInfo.length;i++){
																				for(var j=0;j<vehicleStates.length;j++){
																					if(navigacijaInfo[i].idNavigacije==vehicleStates[j].vehicleId){
																						vehicleStates[j].imeMajstora = navigacijaInfo[i].imeMajstora;
																						vehicleStates[j].idMajstora = navigacijaInfo[i].idMajstora;
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
																				lokacijeMajstora: vehicleStates,
																				user: req.session.user
																			});
																		}catch(err){
																			logError(err)
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
																		}
																	}catch(err){
																		logError(err);
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
																	}
																}
															});



															
														}
													});
												}
											});*/
											
										})
										.catch((error)=>{
											logError(error);
											res.render("message",{
												pageTitle: "Грешка",
												message: "<div class=\"text\">Дошло је до грешке у бази податка 3376.</div>",
												user: req.session.user
											});
										})
										
									}else if(Number(req.session.user.role)==25){
										dodeljivaniNaloziDB.find({nalog:req.params.broj}).toArray()
										.then((dodele)=>{
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
										})
										.catch((error)=>{
											logError(error);
											res.render("message",{
												pageTitle: "Грешка",
												message: "<div class=\"text\">Дошло је до грешке у бази податка 4068.</div>",
												user: req.session.user
											});
										})
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
											if(req.session.user.nalozi=="SeHQZ--1672650353244" || req.session.user.nalozi=="IIwY4--1672650358507"){
												cenovnikZaPrikaz = cenovnikHigh;
											}else{
												cenovnikZaPrikaz = cenovnikLow;
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
								})
								.catch((error)=>{
									logError(error);
									res.render("message",{
										pageTitle: "Грешка",
										message: "<div class=\"text\">Дошло је до грешке у бази податка 565.</div>",
										user: req.session.user
									});
								})
							})
							.catch((error)=>{
								logError(error);
								res.render("message",{
									pageTitle: "Грешка",
									message: "<div class=\"text\">Дошло је до грешке у бази податка 564.</div>",
									user: req.session.user
								});
							})
						})
						.catch((error)=>{
							logError(error);
							res.render("message",{
								pageTitle: "Грешка",
								message: "<div class=\"text\">Дошло је до грешке у бази податка 561.</div>",
								user: req.session.user
							});
						})
					})
					.catch((error)=>{
						logError(error);
						res.render("message",{
							pageTitle: "Грешка",
							message: "<div class=\"text\">Дошло је до грешке у бази податка 475.</div>",
							user: req.session.user
						});
					})
				}else{
					res.render("message",{
						pageTitle: "Непостојећи налог",
						message: "<div class=\"text\">Налог број "+req.params.broj+" не постоји у бази података.</div>",
						user: req.session.user
					});
				}
				
			})
			.catch((error)=>{
				logError(error);
				res.render("message",{
					pageTitle: "Грешка",
					message: "<div class=\"text\">Дошло је до грешке у бази податка 472.</div>",
					user: req.session.user
				});
			})
			
		}else if(Number(req.session.user.role)==40){
			//premijus
			naloziDB.find({broj:req.params.broj.toString()}).toArray()
			.then((nalozi) => {
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
				
			})
			.catch((error)=>{
				logError(error);
				res.render("message",{
					pageTitle: "Грешка",
					message: "<div class=\"text\">Дошло је до грешке у бази податка 710.</div>",
					user: req.session.user
				});
			})
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
				uploadSlika(req, res, function (error) {
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
							izvestajiDB.insertOne(izvestajJson)
							.then((dbResponse)=>{
								if(nalogJson.majstor==nalogJson.stariNalog.majstor){
									res.redirect("/nalog/"+nalogJson.broj);
								}else{
									majstoriDB.find({uniqueId:nalogJson.majstor}).toArray()
									.then((majstori)=>{
										if(majstori.length>0){
											if(majstori[i].hasOwnProperty("kontakt")){
												if(majstori[i].kontakt instanceof Array){
													if(majstori[i].kontakt.length>0){
														var mailOptions = {
															from: '"ВиК Портал Послова Града" <admin@poslovigrada.rs>',
															to: majstori[i].kontakt.join(","),
															subject: 'Додељен вам је нови налог број '+nalogJson.broj,
															html: 'Поштовани '+majstori[0].ime+',<br>Додељен вам је нови ВиК налог на порталу послова града.<br>Број налога: '+nalogJson.broj+'<br>Радна јединица: '+nalogJson.radnaJedinica+'<br>Адреса: <a href=\"https://www.google.com/maps/search/?api=1&query='+nalogJson.adresa.replace(/,/g, '%2C').replace(/ /g, '+')+'\">'+nalogJson.adresa+'</a><br>Захтевалац: '+ nalogJson.zahtevalac+'<br>Опис проблема: '+nalogJson.opis+'<br><a href=\"'+process.env.siteurl+'/nalog/'+nalogJson.broj+'\">Отвори налог на порталу</a>',
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
												}else{
													res.redirect("/nalog/"+nalogJson.broj);
												}
											}else{
												res.redirect("/nalog/"+nalogJson.broj);
											}
										}else{
											res.redirect("/nalog/"+nalogJson.broj);
										}
									})
									.catch((error)=>{
										logError(error);
										res.render("message",{
											pageTitle: "Програмска грешка",
											user:req.session.user,
											message: "<div class=\"text\">Дошло је до грешке у бази податка 2634.</div>"
										});
									})
								}
								
							})
							.catch((error)=>{
								logError(error);
								res.render("message",{
									pageTitle: "Програмска грешка",
									user:req.session.user,
									message: "<div class=\"text\">Дошло је до грешке у бази податка 676.</div>"
								});
							})
						}else{
							//nema izvestaja i nema izmena na nalogu
							res.redirect("/nalog/"+nalogJson.broj);
						}
						
					}else{
						//ima izmena na nalogu
						if(izvestajJson.izvestaj!="" || izvestajJson.photos.length>0){
							//ima izvestaja
							izvestajiDB.insertOne(izvestajJson)
							.then((dbResponse)=>{
								//if(Number(req.session.user.role)==30){
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

								
								naloziDB.updateOne({broj:nalogJson.broj},setObj)
								.then((dbResponse2) => {
									
									nalogJson.stariNalog.izmenio = req.session.user;
									nalogJson.stariNalog.datetime = new Date().getTime();
									istorijaNalogaDB.insertOne(nalogJson.stariNalog)
									.then((dbResponse3)=>{
										if(nalogJson.majstor==nalogJson.stariNalog.majstor){
											res.redirect("/nalog/"+nalogJson.broj);
										}else{
											majstoriDB.find({uniqueId:nalogJson.majstor}).toArray()
											.then((majstori)=>{
												if(majstori.length>0){
													if(majstori[0].hasOwnProperty("kontakt")){
														if(majstori[0].kontakt instanceof Array){
															if(majstori[0].kontakt.length>0){
																var mailOptions = {
																	from: '"ВиК Портал Послова Града" <admin@poslovigrada.rs>',
																	to: majstori[0].kontakt.join(","),
																	subject: 'Додељен вам је нови налог број '+nalogJson.broj,
																	html: 'Поштовани '+majstori[0].ime+',<br>Додељен вам је нови ВиК налог на порталу послова града.<br>Број налога: '+nalogJson.broj+'<br>Радна јединица: '+nalogJson.radnaJedinica+'<br>Адреса: <a href=\"https://www.google.com/maps/search/?api=1&query='+nalogJson.adresa.replace(/,/g, '%2C').replace(/ /g, '+')+'\">'+nalogJson.adresa+'</a><br>Захтевалац: '+ nalogJson.zahtevalac+'<br>Опис проблема: '+nalogJson.opis+'<br><a href=\"'+process.env.siteurl+'/nalog/'+nalogJson.broj+'\">Отвори налог на порталу</a>',
																};

																transporter.sendMail(mailOptions, (error, info) => {
																	if (error) {
																		logError(error);
																		res.redirect("/nalog/"+nalogJson.broj);
																	}else{
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
																	}
																});
															}else{
																res.redirect("/nalog/"+nalogJson.broj);
															}
														}else{
															res.redirect("/nalog/"+nalogJson.broj);
														}
													}else{
														res.redirect("/nalog/"+nalogJson.broj);
													}
												}else{
													res.redirect("/nalog/"+nalogJson.broj);
												}
											})
											.catch((error)=>{
												logError(error);
												res.render("message",{
													pageTitle: "Програмска грешка",
													user:req.session.user,
													message: "<div class=\"text\">Дошло је до грешке у бази податка 2634.</div>"
												});
											})
										}
									})
									.catch((error)=>{
										logError(error);
										res.render("message",{
											pageTitle: "Програмска грешка",
											user:req.session.user,
											message: "<div class=\"text\">Дошло је до грешке у бази податка 664.</div>"
										});
									})
								})
								.catch(error=>{
									logError(error);
									res.render("message",{
										pageTitle: "Програмска грешка",
										user:req.session.user,
										message: "<div class=\"text\">Дошло је до грешке у бази податка 673.</div>"
									});
								})
							})
							.catch((error)=>{
								logError(error);
								res.render("message",{
									pageTitle: "Програмска грешка",
									user:req.session.user,
									message: "<div class=\"text\">Дошло је до грешке у бази податка 676.</div>"
								});
							})
						}else{
							//nema izvestaja
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
							naloziDB.updateOne({broj:nalogJson.broj},setObj)
							.then((dbResponse2) => {
								
								nalogJson.stariNalog.izmenio = req.session.user;
								nalogJson.stariNalog.datetime = new Date().getTime();
								istorijaNalogaDB.insertOne(nalogJson.stariNalog)
								.then((dbResponse3)=>{
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
									
								})
								.catch((error)=>{
									logError(error);
									res.render("message",{
										pageTitle: "Програмска грешка",
										user: req.session.user,
										message: "<div class=\"text\">Дошло је до грешке у бази податка 664.</div>"
									});
								})
							})
							.catch(error=>{
								logError(error);
								res.render("message",{
									pageTitle: "Програмска грешка",
									user: req.session.user,
									message: "<div class=\"text\">Дошло је до грешке у бази податка 673.</div>"
								});
							})
						}
						
					}
				});
			
		}else{
			res.send("Nije definisan nivo korisnika");
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
											tipRada:json.tipRada
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
			naloziDB.find({statusNaloga:"Završeno"}).toArray()
			.then((nalozi)=>{
				for(var i=0;i<nalozi.length;i++){
					if(podizvodjaci.indexOf(nalozi[i].majstor)<0){
						nalozi.splice(i,1);
						i--;
					}
				}
				majstoriDB.find({}).toArray()
				.then((majstori)=>{
					res.render("administracija/zavrseniNaloziPodizvodjaca",{
						pageTitle:"Завршени налози подизвођача",
						nalozi: nalozi,
						cenovnik: cenovnik,
						majstori: majstori,
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

server.get('/vraceniNaloziPodizvodjaca',async (req,res)=>{
	if(req.session.user){
		if(Number(req.session.user.role)==10){
			naloziDB.find({statusNaloga:"Vraćen"}).toArray()
			.then((nalozi)=>{
				for(var i=0;i<nalozi.length;i++){
					if(podizvodjaci.indexOf(nalozi[i].majstor)<0){
						nalozi.splice(i,1);
						i--;
					}
				}
				majstoriDB.find({}).toArray()
				.then((majstori)=>{
					res.render("administracija/vraceniNaloziPodizvodjaca",{
						pageTitle:"Враћени налози подизвођача",
						nalozi: nalozi,
						cenovnik: cenovnik,
						majstori: majstori,
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

server.get('/otvoreniNaloziPodizvodjaca',async (req,res)=>{
	if(req.session.user){
		if(Number(req.session.user.role)==10){
			naloziDB.find({statusNaloga:{$nin:["Vraćen","Storniran","Fakturisan","Završeno","Spreman za fakturisanje",""]}}).toArray()
			.then((nalozi)=>{
				for(var i=0;i<nalozi.length;i++){
					if(podizvodjaci.indexOf(nalozi[i].majstor)<0){
						nalozi.splice(i,1);
						i--;
					}
				}
				majstoriDB.find({}).toArray()
				.then((majstori)=>{
					res.render("administracija/zavrseniNaloziPodizvodjaca",{
						pageTitle:"Додељени налози подизвођача",
						nalozi: nalozi,
						cenovnik: cenovnik,
						majstori: majstori,
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
})

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
			if(Number(req.session.user.role)==10){
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
				naloziDB.find({radnaJedinica:{$in:req.session.user.opstine},statusNaloga:{$nin:["Nalog u Stambenom","Storniran","Vraćen","Spreman za fakturisanje","Fakturisan","Spreman za obračun"]}}).toArray()
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
					res.render("dispeceri/sviNalozi",{
						pageTitle:"Сви налози",
						user: req.session.user,
						nalozi: nalozi
					})
				})
				.catch((error)=>{
					logError(error);
					res.render("message",{
						pageTitle: "Програмска грешка",
						user: req.session.user,
						message: "<div class=\"text\">Дошло је до грешке у бази податка 2487.</div>"
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

server.get('/dispecer/otvoreniNalozi',async (req,res)=>{
	if(req.session.user){
			if(Number(req.session.user.role)==20 || Number(req.session.user.role)==10){
				var skriveniStatusi = ["Završeno","Nalog u Stambenom","Storniran","Vraćen","Spreman za fakturisanje","Fakturisan","Spreman za obračun"];
				if(Number(req.session.user.role)==10){
					skriveniStatusi = ["Nalog u Stambenom","Storniran","Vraćen","Spreman za fakturisanje","Fakturisan","Spreman za obračun"];
				}
				naloziDB.find({radnaJedinica:{$in:req.session.user.opstine},statusNaloga:{$nin:skriveniStatusi}}).toArray()
				.then((nalozi) => {
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
					dodeljivaniNaloziDB.find({nalog:{$in:brojeviNaloga}}).toArray()
					.then((dodele)=>{
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
						res.render("dispeceri/otvoreniNalozi",{
							pageTitle:"Отворени налози",
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
				naloziDB.find({radnaJedinica:{$in:req.session.user.opstine},statusNaloga:{$in:["Završeno","Spreman za obračun"]}}).toArray()
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
					res.render("dispeceri/zavrseniNalozi",{
						pageTitle:"Завршени налози",
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
			naloziDB.find({adresa:{$regex:req.body.adresa}}).toArray()
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
				res.render("dispeceri/pretragaNalogaRezultati",{
					pageTitle:"Резултати претраге за \""+req.body.adresa+"\"",
					user: req.session.user,
					nalozi: nalozi
				})
			})
			.catch((error)=>{
				logError(error);
				res.render("message",{
					pageTitle: "Програмска грешка",
					user: req.session.user,
					message: "<div class=\"text\">Дошло је до грешке у бази податка 940.</div>"
				});
			});
		}else if(Number(req.session.user.role)==30){
			naloziDB.find({majstor:req.session.user.nalozi,adresa:{$regex:req.body.adresa}}).toArray()
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
				res.render("podizvodjaci/pretragaNalogaRezultati",{
					pageTitle:"Резултати претраге за \""+req.body.adresa+"\"",
					user: req.session.user,
					nalozi: nalozi
				})
			})
			.catch((error)=>{
				logError(error);
				res.render("message",{
					pageTitle: "Програмска грешка",
					user: req.session.user,
					message: "<div class=\"text\">Дошло је до грешке у бази податка 940.</div>"
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
			naloziDB.find({majstor:req.session.user.nalozi,statusNaloga:{$nin:["Završeno","Nalog u Stambenom","Storniran","Vraćen","Spreman za fakturisanje","Fakturisan","Spreman za obračun"]}}).toArray()
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
				res.render("podizvodjaci/otvoreniNalozi",{
					pageTitle:"Отворени налози",
					user: req.session.user,
					nalozi: nalozi
				})
			})
			.catch((error)=>{
				logError(error);
				res.render("message",{
					pageTitle: "Програмска грешка",
					user: req.session.user,
					message: "<div class=\"text\">Дошло је до грешке у бази податка 1243.</div>"
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

server.get('/podizvodjac/zavrseniNalozi',async (req,res)=>{
	if(req.session.user){
		if(Number(req.session.user.role)==30){
			naloziDB.find({majstor:req.session.user.nalozi,statusNaloga:{$in:["Završeno","Nalog u Stambenom","Spreman za fakturisanje","Spreman za obračun"]}}).toArray()
			.then((nalozi) => {
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
				if(req.session.user.nalozi=="SeHQZ--1672650353244" || req.session.user.nalozi=="IIwY4--1672650358507"){
					cenovnikZaPrikaz = cenovnikHigh;
				}else{
					cenovnikZaPrikaz = cenovnikLow;
				}
				res.render("podizvodjaci/zavrseniNalozi",{
					pageTitle:"Завршени налози",
					user: req.session.user,
					cenovnik: cenovnikZaPrikaz,
					nalozi: nalozi
				})
			})
			.catch((error)=>{
				logError(error);
				res.render("message",{
					pageTitle: "Програмска грешка",
					user: req.session.user,
					message: "<div class=\"text\">Дошло је до грешке у бази податка 1243.</div>"
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


server.get('/podizvodjac/vraceniNalozi',async (req,res)=>{
	if(req.session.user){
		if(Number(req.session.user.role)==30){
			naloziDB.find({majstor:req.session.user.nalozi,statusNaloga:"Vraćen"}).toArray()
			.then((nalozi) => {
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
				if(req.session.user.nalozi=="SeHQZ--1672650353244" || req.session.user.nalozi=="IIwY4--1672650358507"){
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
			})
			.catch((error)=>{
				logError(error);
				res.render("message",{
					pageTitle: "Програмска грешка",
					user: req.session.user,
					message: "<div class=\"text\">Дошло је до грешке у бази податка 1243.</div>"
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

server.get('/podizvodjac/obradjeniNalozi',async (req,res)=>{
	if(req.session.user){
		if(Number(req.session.user.role)==30){
			naloziDB.find({majstor:req.session.user.nalozi,statusNaloga:"Fakturisan"}).toArray()//OVDE POTREBAN FILTER AKO JE PODIZVODJAC FAKTURISAO NE PRIKAZUJ
			.then((nalozi) => {
				specifikacijePodizvodjacaDB.find({}).toArray()
				.then((specifikacije)=>{
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
						delete nalozi[i].digitalizacija;
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
					if(req.session.user.nalozi=="SeHQZ--1672650353244" || req.session.user.nalozi=="IIwY4--1672650358507"){
						cenovnikZaPrikaz = cenovnikHigh;
					}else{
						cenovnikZaPrikaz = cenovnikLow;
					}
					res.render("podizvodjaci/obradjeniNalozi",{
						pageTitle:"Обрађени налози",
						cenovnik: cenovnikZaPrikaz,
						user: req.session.user,
						nalozi: nalozi
					})
				})
				.catch((error)=>{
					logError(error);
					res.render("message",{
						pageTitle: "Програмска грешка",
						user: req.session.user,
						message: "<div class=\"text\">Дошло је до грешке у бази податка 3426.</div>"
					});
				})
			})
			.catch((error)=>{
				logError(error);
				res.render("message",{
					pageTitle: "Програмска грешка",
					user: req.session.user,
					message: "<div class=\"text\">Дошло је до грешке у бази податка 1311.</div>"
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
			naloziDB.find({majstor:req.session.user.nalozi,statusNaloga:"Fakturisan"}).toArray()//OVDE POTREBAN FILTER AKO JE PODIZVODJAC FAKTURISAO PRIKAZUJ
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
				res.render("podizvodjaci/fakturisaniNalozi",{
					pageTitle:"Фактурисани налози",
					user: req.session.user,
					nalozi: nalozi
				})
			})
			.catch((error)=>{
				logError(error);
				res.render("message",{
					pageTitle: "Програмска грешка",
					user: req.session.user,
					message: "<div class=\"text\">Дошло је до грешке у бази податка 1311.</div>"
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
			json.datum = getDateAsStringForDisplay(new Date());
			json.datetime = new Date().getTime();
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
				adresa: json.adresa
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
			proizvodiDB.find({}).toArray()
			.then((proizvodi)=>{
				majstoriDB.find({}).toArray()
				.then((majstori)=>{
					magacinReversiDB.find({uniqueId:req.params.uniqueId}).toArray()
					.then((reversi)=>{
						if(reversi.length>0){
							naloziDB.find({broj:reversi[0].nalog}).toArray()
							.then((nalozi)=>{
								var nalog = {};
								if(nalozi.length>0){
									nalog = nalozi[0]
								}
								res.render("magacioner/revers",{
									pageTitle:"Rеверс по налогу "+reversi[0].nalog,
									proizvodi: proizvodi,
									majstori: majstori,
									nalog: nalog,
									revers: reversi[0],
									user: req.session.user
								})
							})
							.catch((error)=>{
								logError(error);
								res.render("message",{
									pageTitle: "Програмска грешка",
									user: req.session.user,
									message: "<div class=\"text\">Дошло је до грешке у бази податка 3097.</div>"
								})
							})
							
						}else{
							res.render("message",{
								pageTitle: "Грешка",
								user: req.session.user,
								message: "<div class=\"text\">Реверс није у бази података или је обрисан.</div>"
							});
						}
						
					})
					.catch((error)=>{
						logError(error);
						res.render("message",{
							pageTitle: "Програмска грешка",
							user: req.session.user,
							message: "<div class=\"text\">Дошло је до грешке у бази податка 3095.</div>"
						})
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
			magacinReversiDB.find({nalog:req.params.brojNaloga}).toArray()
			.then((reversi)=>{
				naloziDB.find({broj:req.params.brojNaloga.toString()}).toArray()
				.then((nalozi)=>{
					majstoriDB.find({}).toArray()
					.then((majstori)=>{
						res.render("magacioner/rezultatPretrage",{
							pageTitle: "Резлтати претраге реверса по налогу "+req.params.brojNaloga,
							user: req.session.user,
							reversi: reversi,
							majstori: majstori,
							nalozi: nalozi
						});
					})
					.catch((error)=>{
						logError(error);
						res.render("message",{
							pageTitle: "Програмска грешка",
							user: req.session.user,
							message: "<div class=\"text\">Дошло је до грешке у бази податка 3261.</div>"
						});
					})
					
				})
				.catch((error)=>{
					logError(error);
					res.render("message",{
						pageTitle: "Програмска грешка",
						user: req.session.user,
						message: "<div class=\"text\">Дошло је до грешке у бази податка 3264.</div>"
					});
				})
				
			})
			.catch((error)=>{
				logError(error);
				res.render("message",{
					pageTitle: "Програмска грешка",
					user: req.session.user,
					message: "<div class=\"text\">Дошло је до грешке у бази податка 3261.</div>"
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

server.post('/pretraga-reversa', async (req, res)=> {
	if(req.session.user){
		if(Number(req.session.user.role)==50){
			magacinReversiDB.find({nalog:req.body.brojnaloga}).toArray()
			.then((reversi)=>{
				naloziDB.find({broj:req.body.brojnaloga.toString()}).toArray()
				.then((nalozi)=>{
					majstoriDB.find({}).toArray()
					.then((majstori)=>{
						res.render("magacioner/rezultatPretrage",{
							pageTitle: "Резлтати претраге реверса по налогу "+req.body.brojnaloga,
							user: req.session.user,
							reversi: reversi,
							majstori: majstori,
							nalozi: nalozi
						});
					})
					.catch((error)=>{
						logError(error);
						res.render("message",{
							pageTitle: "Програмска грешка",
							user: req.session.user,
							message: "<div class=\"text\">Дошло је до грешке у бази податка 3261.</div>"
						});
					})
					
				})
				.catch((error)=>{
					logError(error);
					res.render("message",{
						pageTitle: "Програмска грешка",
						user: req.session.user,
						message: "<div class=\"text\">Дошло је до грешке у бази податка 3264.</div>"
					});
				})
				
			})
			.catch((error)=>{
				logError(error);
				res.render("message",{
					pageTitle: "Програмска грешка",
					user: req.session.user,
					message: "<div class=\"text\">Дошло је до грешке у бази податка 3261.</div>"
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




server.get('/magacioner/danasnjiReversi', async (req, res)=> {
	if(req.session.user){
		if(Number(req.session.user.role)==50){
			var today = new Date();
			var dateString = today.getDate().toString().length==1 ? "0"+today.getDate() : today.getDate();
			var monthString = eval(today.getMonth()+1).toString().length==1 ? "0"+eval(today.getMonth()+1) : eval(today.getMonth()+1);
			magacinReversiDB.find({datum:{$regex:dateString+"."+monthString+"."+new Date().getFullYear()}}).toArray()
			.then((reversi)=>{
				var naloziToFind = [];
				for(var i=0;i<reversi.length;i++){
					naloziToFind.push(reversi[i].nalog);
				}
				naloziDB.find({broj:{$in:naloziToFind}}).toArray()
				.then((nalozi)=>{
					majstoriDB.find({}).toArray()
					.then((majstori)=>{
						res.render("magacioner/rezultatPretrage",{
							pageTitle: "Данашњи реверси",
							user: req.session.user,
							reversi: reversi,
							majstori: majstori,
							nalozi: nalozi
						});
					})
					.catch((error)=>{
						logError(error);
						res.render("message",{
							pageTitle: "Програмска грешка",
							user: req.session.user,
							message: "<div class=\"text\">Дошло је до грешке у бази податка 3439.</div>"
						});
					})
					
				})
				.catch((error)=>{
					logError(error);
					res.render("message",{
						pageTitle: "Програмска грешка",
						user: req.session.user,
						message: "<div class=\"text\">Дошло је до грешке у бази податка 3449.</div>"
					});
				})
				
			})
			.catch((error)=>{
				logError(error);
				res.render("message",{
					pageTitle: "Програмска грешка",
					user: req.session.user,
					message: "<div class=\"text\">Дошло је до грешке у бази податка 3459.</div>"
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

server.get('/magacioner/jucerasnjiReversi', async (req, res)=> {
	if(req.session.user){
		if(Number(req.session.user.role)==50){
			var today = new Date();
			today.setDate(today.getDate()-1);
			var dateString = today.getDate().toString().length==1 ? "0"+today.getDate() : today.getDate();
			var monthString = eval(today.getMonth()+1).toString().length==1 ? "0"+eval(today.getMonth()+1) : eval(today.getMonth()+1);
			magacinReversiDB.find({datum:{$regex:dateString+"."+monthString+"."+new Date().getFullYear()}}).toArray()
			.then((reversi)=>{
				var naloziToFind = [];
				for(var i=0;i<reversi.length;i++){
					naloziToFind.push(reversi[i].nalog);
				}
				naloziDB.find({broj:{$in:naloziToFind}}).toArray()
				.then((nalozi)=>{
					majstoriDB.find({}).toArray()
					.then((majstori)=>{
						res.render("magacioner/rezultatPretrage",{
							pageTitle: "Јучерашњи реверси",
							user: req.session.user,
							reversi: reversi,
							majstori: majstori,
							nalozi: nalozi
						});
					})
					.catch((error)=>{
						logError(error);
						res.render("message",{
							pageTitle: "Програмска грешка",
							user: req.session.user,
							message: "<div class=\"text\">Дошло је до грешке у бази податка 3439.</div>"
						});
					})
					
				})
				.catch((error)=>{
					logError(error);
					res.render("message",{
						pageTitle: "Програмска грешка",
						user: req.session.user,
						message: "<div class=\"text\">Дошло је до грешке у бази податка 3449.</div>"
					});
				})
				
			})
			.catch((error)=>{
				logError(error);
				res.render("message",{
					pageTitle: "Програмска грешка",
					user: req.session.user,
					message: "<div class=\"text\">Дошло је до грешке у бази податка 3459.</div>"
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

server.get('/magacioner/prekojucerasnjiReversi', async (req, res)=> {
	if(req.session.user){
		if(Number(req.session.user.role)==50){
			var today = new Date();
			today.setDate(today.getDate()-2);
			var dateString = today.getDate().toString().length==1 ? "0"+today.getDate() : today.getDate();
			var monthString = eval(today.getMonth()+1).toString().length==1 ? "0"+eval(today.getMonth()+1) : eval(today.getMonth()+1);
			magacinReversiDB.find({datum:{$regex:dateString+"."+monthString}}).toArray()
			.then((reversi)=>{
				var naloziToFind = [];
				for(var i=0;i<reversi.length;i++){
					naloziToFind.push(reversi[i].nalog);
				}
				naloziDB.find({broj:{$in:naloziToFind}}).toArray()
				.then((nalozi)=>{
					majstoriDB.find({}).toArray()
					.then((majstori)=>{
						res.render("magacioner/rezultatPretrage",{
							pageTitle: "Јучерашњи реверси",
							user: req.session.user,
							reversi: reversi,
							majstori: majstori,
							nalozi: nalozi
						});
					})
					.catch((error)=>{
						logError(error);
						res.render("message",{
							pageTitle: "Програмска грешка",
							user: req.session.user,
							message: "<div class=\"text\">Дошло је до грешке у бази податка 3439.</div>"
						});
					})
					
				})
				.catch((error)=>{
					logError(error);
					res.render("message",{
						pageTitle: "Програмска грешка",
						user: req.session.user,
						message: "<div class=\"text\">Дошло је до грешке у бази податка 3449.</div>"
					});
				})
				
			})
			.catch((error)=>{
				logError(error);
				res.render("message",{
					pageTitle: "Програмска грешка",
					user: req.session.user,
					message: "<div class=\"text\">Дошло је до грешке у бази податка 3459.</div>"
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

server.post('/fakturisi', async (req, res)=> {
	if(req.session.user){
		if(Number(req.session.user.role)==40){
			var json = JSON.parse(req.body.json);
			var samoBroj = 0;
			try{
				samoBroj = json.brojFakture.toLowerCase().split(".").join("").split("s-")[1].split("/202")[0];
			}catch(err){
				logError(err)
			}
			var setObj	=	{ $set: {
											"faktura.broj": 	json.brojFakture,
											"faktura.samoBroj": samoBroj,
											"faktura.pdv": 	json.pdv
										}};
			naloziDB.updateOne({broj:json.brojNaloga.toString()},setObj)
			.then((dbResponse)=>{
				const worker 		=	new Worker("./fakturaWorker.js",{ env:SHARE_ENV});
				worker.postMessage(req.body.json);
				worker.on("message",(data)=>{
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
							naloziDB.updateOne({broj:json.brojNaloga.toString()},setObj)
							.then((dbResponse2)=>{
								res.redirect("/nalog/"+json.brojNaloga);
							})
							.catch((error)=>{
								logError(error)
								res.render("message",{
									pageTitle: "Грешка",
									user: req.session.user,
									message: "<div class=\"text\">Грешка на порталу. Фактура је окачена на СЕФ али статус налога није промењен у Фактурисан.</div>"
								});
							})
							
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
			})
			.catch((error)=>{
				logError(error);
				res.render("message",{
					pageTitle: "Грешка",
					user: req.session.user,
					message: "<div class=\"text\">Грешка на порталу, база података 3369. Није ништа посалто на СЕФ.</div>"
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
	var nalogJSON = {};
	nalogJSON.datetime = new Date().getTime();
	nalogJSON.date = new Date().getFullYear()+"."+eval(new Date().getMonth()+1)+"."+new Date().getDate();
	nalogJSON.reqBody = req.body;
	nalogJSON.reqHeader = req.headers;
	nalogJSON.source = "POST";
	/*portalStambenoTestDB.insertOne(nalogJSON)
	.then((dbResponseTest)=>{

	})
	.catch((error)=>{
		logError(error)
	})*/
	if(nalogJSON.reqBody.hasOwnProperty("note_details")){
		try{
			var izvestajJson = {};
			izvestajJson.uniqueId = generateId(5)+"--"+new Date().getTime();
			izvestajJson.nalog = nalogJSON.reqBody.note_details[0].broj_naloga.toString();
			izvestajJson.datetime = new Date().getTime();
			izvestajJson.datum = getDateAsStringForDisplay(new Date());
			izvestajJson.izvestaj = nalogJSON.reqBody.note_details[0].tekst_beleske;
			izvestajJson.photos = [];
			izvestajJson.user = {};
			izvestajJson.user.email = nalogJSON.reqBody.note_details[0].kreirao_belesku;
			izvestajJson.user.name = "PORTAL STAMBENO <sub>"+nalogJSON.reqBody.note_details[0].kreirao_belesku+"</sub>";
			izvestajiDB.insertOne(izvestajJson)
			.then((dbResponse)=>{
				stambenoDB.insertOne(nalogJSON)
				.then((dbResponse2)=>{
					naloziDB.find({}).toArray()
					.then((nalozi)=>{
						if(nalogJSON.reqBody.note_details[0].kreirao_belesku.includes("stambeno") || nalogJSON.reqBody.note_details[0].kreirao_belesku.includes("STAMBENO")){
							io.emit("notification","noviKomentar","<div class=\"title\">KOMENTAR STAMBENOG</div><div class=\"text\"><a href=\"/nalog/"+nalozi[0].broj+"\" target=\"blank\">"+nalozi[0].broj+"</a> - <span class=\"adresa\">"+nalozi[0].adresa+"</span> - <span class=\"radnaJedinica\">"+nalozi[0].radnaJedinica+"</span></span></div>",nalozi[0].radnaJedinica)
						}
						/*var testInsert = {};
						testInsert.type = "TEST";
						testInsert.json = nalogJSON.reqBody.note_details[0];*/
						//stambeno2DB.insertOne(testInsert)
						//.then((dbResponse2)=>{
							res.status(200);
							res.setHeader('Content-Type', 'application/json');
							var primerJson = {"code":"200","message":"Primio sam podatke za belesku.","warnings":{"vrsta_promene":"Missing type of change","broj_ugovora":"Contract number is missing"}}
							res.send(JSON.stringify(primerJson));
						//})
						//.catch((error)=>{
							//logError(error);
							
						//})
						
					})
					.catch((error)=>{
						logError(error);
						res.status(501);
						res.setHeader('Content-Type', 'application/json');
						var primerJson = {"code":"501","message":"Neuspesan prijem beleske"}
						res.send(JSON.stringify(primerJson));
					})
					
				})
				.catch((error)=>{
					logError(error);
					res.status(501);
					res.setHeader('Content-Type', 'application/json');
					var primerJson = {"code":"501","message":"Neuspesan prijem beleske"}
					res.send(JSON.stringify(primerJson));
				})
				
			})
			.catch((error)=>{
				logError(error);
				res.status(501);
				res.setHeader('Content-Type', 'application/json');
				var primerJson = {"code":"501","message":"Neuspesan prijem beleske"}
				res.send(JSON.stringify(primerJson));
			})
		}catch(err){
			logError(err);
			res.status(501);
			res.setHeader('Content-Type', 'application/json');
			var primerJson = {"code":"501","message":"Neuspesan prijem beleske 2"}
			res.send(JSON.stringify(primerJson));
		}
	}else if(nalogJSON.reqBody.hasOwnProperty("order_headers")){
		var stambenoJson = JSON.parse(JSON.stringify(nalogJSON.reqBody.order_headers[0]));
		naloziDB.find({broj:stambenoJson.broj_naloga.toString()}).toArray()
		.then((nalozi)=>{
			if(nalozi.length==0){
				var currentDate = new Date();
				var nalogJson	=	{
					uniqueId: generateId(15) +"--"+ new Date().getTime().toString(),
					digitalizacija: {
						datetime: currentDate.getTime(),
						datum: getDateAsStringForDisplay(currentDate),
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
					opis:stambenoJson.opis,
					vrstaRada: stambenoJson.tip_naloga,
					radnaJedinica: stambenoJson.radna_jedinica,
					datum:{
						punDatum: currentDate,
						datum: getDateAsStringForDisplay(currentDate),
						datetime: currentDate.getTime()
					},
					zahtevalac: stambenoJson.zahtevalac,
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
				io.emit("notification","noviNalog","<div class=\"title\">NOVI NALOG</div><div class=\"text\"><a href=\"/nalog/"+nalogJson.broj+"\" target=\"blank\">"+nalogJson.broj+"</a> - <span class=\"adresa\">"+nalogJson.adresa+"</span> - <span class=\"radnaJedinica\">"+nalogJson.radnaJedinica+"</span></span></div>",nalogJson.radnaJedinica)

				 


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
									naloziDB.insertOne(nalogJson)
									.then((dbResponse)=>{

										res.status(200);
										res.setHeader('Content-Type', 'application/json');
										var primerJson = {"code":"200","message":"Primio sam podatke za nalog.","warnings":{"vrsta_promene":"Missing type of change","broj_ugovora":"Contract number is missing"}}
										res.send(JSON.stringify(primerJson));
										websiteOptions.body = JSON.stringify({datum: nalogJson.digitalizacija.datum,vreme: new Date().getHours().toString().padStart(2,"0")+":"+new Date().getMinutes().toString().padStart(2,"0"),radnaJedinica: nalogJson.radnaJedinica, adresa: nalogJson.adresa});
										request(websiteOptions, (error,response,body)=>{
											if(error){
												logError(error)
											}
										});

									})
									.catch((error)=>{
										logError(error)
										res.status(501);
										res.setHeader('Content-Type', 'application/json');
										var primerJson = {"code":"501","message":"Neuspesan prijem naloga"}
										res.send(JSON.stringify(primerJson));
									})
								}else{
									nalogJson.coordinates = {}; 
									naloziDB.insertOne(nalogJson)
									.then((dbResponse)=>{
										res.status(200);
										res.setHeader('Content-Type', 'application/json');
										var primerJson = {"code":"200","message":"Primio sam podatke za nalog.","warnings":{"vrsta_promene":"Missing type of change","broj_ugovora":"Contract number is missing"}}
										res.send(JSON.stringify(primerJson));
										websiteOptions.body = JSON.stringify({datum: nalogJson.digitalizacija.datum,vreme: new Date().getHours().toString().padStart(2,"0")+":"+new Date().getMinutes().toString().padStart(2,"0"),radnaJedinica: nalogJson.radnaJedinica, adresa: nalogJson.adresa});
										request(websiteOptions, (error,response,body)=>{
											if(error){
												logError(error)
											}
										});
									})
									.catch((error)=>{
										logError(error)
										res.status(501);
										res.setHeader('Content-Type', 'application/json');
										var primerJson = {"code":"501","message":"Neuspesan prijem naloga"}
										res.send(JSON.stringify(primerJson));
									})
								}
							}else{
								nalogJson.coordinates = {}; 
								naloziDB.insertOne(nalogJson)
								.then((dbResponse)=>{
									res.status(200);
									res.setHeader('Content-Type', 'application/json');
									var primerJson = {"code":"200","message":"Primio sam podatke za nalog.","warnings":{"vrsta_promene":"Missing type of change","broj_ugovora":"Contract number is missing"}}
									res.send(JSON.stringify(primerJson));
									websiteOptions.body = JSON.stringify({datum: nalogJson.digitalizacija.datum,vreme: new Date().getHours().toString().padStart(2,"0")+":"+new Date().getMinutes().toString().padStart(2,"0"),radnaJedinica: nalogJson.radnaJedinica, adresa: nalogJson.adresa});
										request(websiteOptions, (error,response,body)=>{
											if(error){
												logError(error)
											}
										});
								})
								.catch((error)=>{
									logError(error)
									res.status(501);
									res.setHeader('Content-Type', 'application/json');
									var primerJson = {"code":"501","message":"Neuspesan prijem naloga"}
									res.send(JSON.stringify(primerJson));
								})
							}
						}else{
							nalogJson.coordinates = {}; 
							naloziDB.insertOne(nalogJson)
							.then((dbResponse)=>{
								res.status(200);
								res.setHeader('Content-Type', 'application/json');
								var primerJson = {"code":"200","message":"Primio sam podatke za nalog.","warnings":{"vrsta_promene":"Missing type of change","broj_ugovora":"Contract number is missing"}}
								res.send(JSON.stringify(primerJson));
								websiteOptions.body = JSON.stringify({datum: nalogJson.digitalizacija.datum,vreme: new Date().getHours().toString().padStart(2,"0")+":"+new Date().getMinutes().toString().padStart(2,"0"),radnaJedinica: nalogJson.radnaJedinica, adresa: nalogJson.adresa});
								request(websiteOptions, (error,response,body)=>{
									if(error){
										logError(error)
									}
								});
							})
							.catch((error)=>{
								logError(error)
								res.status(501);
								res.setHeader('Content-Type', 'application/json');
								var primerJson = {"code":"501","message":"Neuspesan prijem naloga"}
								res.send(JSON.stringify(primerJson));
							})
						}
					}
				});
				
			}else{
				//Nalog Postoji, pokusaj da ubacis obracun (mozda i da stavis status vracen), al proveri da li je mozda u statusu fakturisan
				//console.log("TU SI!!!")
				if(nalozi[0].statusNaloga!="Fakturisan"){
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
						if(obracun.length>0){
							var setObj	=	{ $set: {
								obracun: obracun,
								statusNaloga: "Nalog u Stambenom",
								ukupanIznos: ukupanIznos
							}};
							naloziDB.updateOne({uniqueId:nalozi[0].uniqueId},setObj)
							.then((dbResponse)=>{
								portalStambenoTestDB.insertOne(stambenoJson)
								.then((stambenoResponse)=>{
									res.status(200);
									res.setHeader('Content-Type', 'application/json');
									var primerJson = {"code":"200","message":"Primio sam podatke za postojeci nalog.","warnings":{"vrsta_promene":"Missing type of change","broj_ugovora":"Contract number is missing"}}
									res.send(JSON.stringify(primerJson));
								})
								.catch((error)=>{
									logError(err);
									res.status(500);
									res.send("Database error");
								})
								
							})
							.catch((error)=>{
								logError(err);
								res.status(500);
								res.send("Database error");
							})	
						}else{
							portalStambenoTestDB.insertOne(stambenoJson)
							.then((stambenoResponse)=>{
								res.status(200);
								res.setHeader('Content-Type', 'application/json');
								var primerJson = {"code":"200","message":"Primio sam podatke za postojeci nalog.","warnings":{"vrsta_promene":"Missing type of change","broj_ugovora":"Contract number is missing"}}
								res.send(JSON.stringify(primerJson));
							})
							.catch((error)=>{
								logError(err);
								res.status(500);
								res.send("Database error");
							})
						}	
					}else if(stambenoJson.vrsta_promene=="STATUS" && stambenoJson.status_code=="IZVRSEN"){
						var setObj	=	{ $set: {
							statusNaloga: "Završeno"
						}};
						naloziDB.updateOne({uniqueId:nalozi[0].uniqueId},setObj)
						.then((dbResponse)=>{
							portalStambenoTestDB.insertOne(stambenoJson)
							.then((stambenoResponse)=>{
								res.status(200);
								res.setHeader('Content-Type', 'application/json');
								var primerJson = {"code":"200","message":"Primio sam podatke za postojeci nalog.","warnings":{"vrsta_promene":"Missing type of change","broj_ugovora":"Contract number is missing"}}
								res.send(JSON.stringify(primerJson));
							})
							.catch((error)=>{
								logError(err);
								res.status(500);
								res.send("Database error");
							})
							
						})
						.catch((error)=>{
							logError(err);
							res.status(500);
							res.send("Database error");
						})
					}else if(stambenoJson.vrsta_promene=="STATUS" && stambenoJson.status_code=="VRACEN"){
						var setObj	=	{ $set: {
							statusNaloga: "Vraćen"
						}};
						naloziDB.updateOne({uniqueId:nalozi[0].uniqueId},setObj)
						.then((dbResponse)=>{
							portalStambenoTestDB.insertOne(stambenoJson)
							.then((stambenoResponse)=>{
								var podizvodjac = podizvodjaci.indexOf(nalozi[0].majstor)>=0 ? "ПОДИЗВОЂАЧА" : "";
								var mailOptions = {
									from: '"ВиК Портал Послова Града" <admin@poslovigrada.rs>',
									to: 'marija.slijepcevic@poslovigrada.rs,miloscane@gmail.com',
									subject: 'Налог број '+podizvodjac+' '+nalozi[0].broj+' је враћен',
									html: 'Поштовани/а,<br>Налог '+podizvodjac+' <a href=\"https://vik2024.poslovigrada.rs/nalog/'+nalozi[0].broj+'\">'+nalozi[0].broj+'</a> је враћен.<br> Радна Јединица: '+nalozi[0].radnaJedinica+'<br>Adresa: '+nalozi[0].adresa+'.'
								};

								transporter.sendMail(mailOptions, (error, info) => {
									if (error) {
										logError(error);
									}
									res.status(200);
									res.setHeader('Content-Type', 'application/json');
									var primerJson = {"code":"200","message":"Primio sam podatke za postojeci nalog.","warnings":{"vrsta_promene":"Missing type of change","broj_ugovora":"Contract number is missing"}}
									res.send(JSON.stringify(primerJson));
								});
								
							})
							.catch((error)=>{
								logError(err);
								res.status(500);
								res.send("Database error");
							})
							
						})
						.catch((error)=>{
							logError(err);
							res.status(500);
							res.send("Database error");
						})
					}else if(stambenoJson.vrsta_promene=="STATUS" && stambenoJson.status_code=="OTKAZAN"){
						var setObj	=	{ $set: {
							statusNaloga: "Storniran"
						}};
						naloziDB.updateOne({uniqueId:nalozi[0].uniqueId},setObj)
						.then((dbResponse)=>{
							portalStambenoTestDB.insertOne(stambenoJson)
							.then((stambenoResponse)=>{
								var mailOptions = {
									from: '"ВиК Портал Послова Града" <admin@poslovigrada.rs>',
									to: 'marija.slijepcevic@poslovigrada.rs,miloscane@gmail.com',
									subject: 'Налог број '+nalozi[0].broj+' је сторниран',
									html: 'Поштовани/а,<br>Налог <a href=\"https://vik2024.poslovigrada.rs/nalog/'+nalozi[0].broj+'\">'+nalozi[0].broj+'</a> је сторниран.<br> Радна Јединица: '+nalozi[0].radnaJedinica+'<br>Adresa: '+nalozi[0].adresa+'.'
								};

								transporter.sendMail(mailOptions, (error, info) => {
									if (error) {
										logError(error);
									}
									res.status(200);
									res.setHeader('Content-Type', 'application/json');
									var primerJson = {"code":"200","message":"Primio sam podatke za postojeci nalog.","warnings":{"vrsta_promene":"Missing type of change","broj_ugovora":"Contract number is missing"}}
									res.send(JSON.stringify(primerJson));
								});

								
							})
							.catch((error)=>{
								logError(err);
								res.status(500);
								res.send("Database error");
							})
						})
						.catch((error)=>{
							logError(err);
							res.status(500);
							res.send("Database error");
						})
					}else{
						portalStambenoTestDB.insertOne(stambenoJson)
						.then((stambenoResponse)=>{
							res.status(200);
							res.setHeader('Content-Type', 'application/json');
							var primerJson = {"code":"200","message":"Primio sam podatke za postojeci nalog.","warnings":{"vrsta_promene":"Missing type of change","broj_ugovora":"Contract number is missing"}}
							res.send(JSON.stringify(primerJson));
						})
						.catch((error)=>{
							logError(err);
							res.status(500);
							res.send("Database error");
						})
					}
					
					

				}else{
					res.status(200);
					res.setHeader('Content-Type', 'application/json');
					var primerJson = {"code":"200","message":"Primio sam podatke za fakturisan nalog.","warnings":{"vrsta_promene":"Missing type of change","broj_ugovora":"Contract number is missing"}}
					res.send(JSON.stringify(primerJson));
				}
			}
		})
		.catch((error)=>{
			logError(error);
			res.status(501);
			res.setHeader('Content-Type', 'application/json');
			var primerJson = {"code":"501","message":"Baza podataka"}
			res.send(JSON.stringify(primerJson));
		})
		
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
	/*naloziDB.find({majstor:{$nin:podizvodjaci},statusNaloga:{$nin:["Završeno","Storniran","Vraćen","Fakturisan","Spreman za fakturisanje","Nalog u Stambenom"]}}).toArray()
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
					res.render("mapaUzivo",{
						pageTitle: "Мапа радова",
						nalozi: nalozi,
						majstori: majstori,
						googlegeocoding: process.env.googlegeocoding
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
	})*/


	/*var date = new Date();
	var year = new Date().getFullYear();
	//date.setDate(date.getDate()-2)
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
			checkInMajstoraDB.find({year:year,month:month,date:dateStr}).toArray()
			.then((checkIns)=>{
		    ekipeDB.find({}).toArray()
		    .then((ekipe)=>{
		    	dodeljivaniNaloziDB.find({"datum.datum":getDateAsStringForDisplay(date)}).toArray()
		    	.then((dodele)=>{
		    		navigacijaInfoDB.find({}).toArray()
		    		.then((vozila)=>{

		    			stariUcinakMajstoraDB.find({majstor:{$in:majstorIdArray},datum:{$regex:year+"-"+month}}).toArray()
		    			.then((ucinci)=>{
		    				for(var i=0;i<majstori.length;i++){
		    					majstori[i].ucinak = 0;
		    					for(var j=0;j<ucinci.length;j++){
		    						if(majstori[i].uniqueId==ucinci[j].majstor){
		    							majstori[i].ucinak = majstori[i].ucinak + parseFloat(ucinci[j].ukupanIznos);
		    						}
		    					}
		    				}
		    				res.render("tv",{
							    pageTitle: "Прозор",
							    pomocnici: pomocnici,
							    majstori: majstori,
							    checkIns: checkIns,
							    ekipe: ekipe.length==0 ? {} : ekipe[ekipe.length-1],
							    vozila: vozila,
							    mapKey: process.env.googlegeocoding,
							    dodele: dodele
							  });

		    			})
		    			.catch((error)=>{
		    				logError(error);
								res.send("Greska 7")	
		    			})
		    			
		    		})
		    		.catch((error)=>{
		    			logError(error);
							res.send("Greska 6")	
		    		})
		    		
		    	})
		    	.catch((error)=>{
		    		logError(error);
						res.send("Greska 5")	
		    	})
		    })
		    .catch((error)=>{
		    	logError(error);
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
		logError(error);
		res.send("Greska")
	})*/
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
			dodeljivaniNaloziDB.find({majstor:req.session.user.uniqueId,"datum.datum":getDateAsStringForDisplay(today)}).toArray()
			.then((nalozi)=>{
				var brojeviNaloga = [];
				for(var i=0;i<nalozi.length;i++){
					if(brojeviNaloga.indexOf(nalozi[i].nalog)<0){
						brojeviNaloga.push(nalozi[i].nalog);
					}
				}
				naloziDB.find({broj:{$in:brojeviNaloga}}).toArray()
				.then((nalozi2)=>{
					for(var i=0;i<nalozi.length;i++){
						nalozi[i].izvestaji = [];
						for(var j=0;j<nalozi2.length;j++){
							if(nalozi2[j].broj==nalozi[i].nalog){
								nalozi[i].opis = nalozi2[j].opis;
								nalozi[i].zahtevalac = nalozi2[j].zahtevalac;
							}
						}
					}
					izvestajiDB.find({nalog:{$in:brojeviNaloga}}).toArray()
					.then((izvestaji)=>{
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
					})
					.catch((error)=>{
						logError(error);
						res.render("message",{
	            pageTitle: "Грешка",
	            user: req.session.user,
	            message: "<div class=\"text\">Грешка у бази података 6690.</div>"
		        });	
					})
					
				})
				.catch((error)=>{
					logError(error);
					res.render("message",{
            pageTitle: "Грешка",
            user: req.session.user,
            message: "<div class=\"text\">Грешка у бази података 6679.</div>"
	        });	
				})
			})
			.catch((error)=>{
				logError(error);
				res.render("message",{
            pageTitle: "Грешка",
            user: req.session.user,
            message: "<div class=\"text\">Грешка у бази података 6669.</div>"
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

server.get('/majstor/mesec/:datum', async (req, res)=> {
	if(req.session.user){
		if(Number(req.session.user.role)==60){
			dodeljivaniNaloziDB.find({majstor:req.session.user.uniqueId,"datum.datum":{$regex:req.params.datum}}).toArray()
			.then((dodele)=>{
				var brojeviNaloga = [];
				for(var i=0;i<dodele.length;i++){
					if(brojeviNaloga.indexOf(dodele[i].nalog)<0){
						brojeviNaloga.push(dodele[i].nalog);
					}
				}
				naloziDB.find({broj:{$in:brojeviNaloga}}).toArray()
				.then((nalozi)=>{
					var mesecString = "";
					for(var i=0;i<meseciJson.length;i++){
						if(meseciJson[i].string==req.params.datum){
							mesecString = meseciJson[i].string;
						}
					}
					checkInMajstoraDB.find({uniqueId:req.session.user.uniqueId,month:req.params.datum.split(".")[0],year:Number(req.params.datum.split(".")[1])}).toArray()
					.then((checkIns)=>{
						opomeneDB.find({uniqueId:req.session.user.uniqueId,month:req.params.datum.split(".")[0],year:Number(req.params.datum.split(".")[1])}).toArray()
						.then((opomene)=>{
							res.render("majstor/majstorMesec",{
								user: req.session.user,
								pageTitle: "Pregled za "+mesecString,
								nalozi: nalozi,
								datum: req.params.datum,
								checkIns: checkIns,
								opomene: opomene,
								dodele: dodele
							})
						})
						.catch((error)=>{
							logError(error)
							res.render("message",{
			          pageTitle: "Грешка",
			          user: req.session.user,
			          message: "<div class=\"text\">Грешка у бази података 9413.</div>"
			        });
						})
						
					})
					.catch((error)=>{
						logError(error)
						res.render("message",{
		          pageTitle: "Грешка",
		          user: req.session.user,
		          message: "<div class=\"text\">Грешка у бази података 9399.</div>"
		        });
					})
				})
				.catch((error)=>{
					logError(error)
					res.render("message",{
	          pageTitle: "Грешка",
	          user: req.session.user,
	          message: "<div class=\"text\">Грешка у бази података 9399.</div>"
	        });
				})
			})
			.catch((error)=>{
				logError(error)
				res.render("message",{
            pageTitle: "Грешка",
            user: req.session.user,
            message: "<div class=\"text\">Грешка у бази података 9399.</div>"
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
				    izvestajJson.signature = nalogJson.signature ? nalogJson.signature : [];
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

/*server.get('/temp', async (req, res)=> {
	if(req.session.user){
		if(Number(req.session.user.role)==10){
			stariUcinakMajstoraDB.find({}).toArray()
			.then((ucinci)=>{
				majstoriDB.find({}).toArray()
				.then((majstori)=>{
					for(var i=0;i<majstori.length;i++){
						majstori[i].ucinci = [];
						for(var j=0;j<ucinci.length;j++){
							if(ucinci[j].majstor==majstori[i].uniqueId){
								majstori[i].ucinci.push(ucinci[j]);
							}
						}
					}
					for(var i=0;i<majstori.length;i++){
						if(majstori[i].ucinci.length==0){
							majstori.splice(i,1);
							i--;
						}
					}
					res.render("temp",{
						pageTitle: "Ucinak",
						user: req.session.user,
						majstori: majstori,
						kategorije: stariCenovnikJsons
					})
				})
				.catch((error)=>{
					console.log(error);
					res.send(error)
				})
			})
			.catch((error)=>{
				console.log(error);
				res.send(error)
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
});*/

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
							if(nalogToPush.faktura.broj.includes("2025"))
							naloziToSend.push(nalogToPush)
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


