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
dotenv.config();

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
        cb(null, new Date().getTime().toString() +".jpg")
      },
      transform: function (req, file, cb) {
        cb(null, sharp({ failOnError: false }).resize(1400,null).withMetadata().jpeg())
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
}).array('image', 10);


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

var mailPotpis = "<br>&nbsp;<br>Срдачан поздрав,<br>ВиК Портал Послова Града<br><img style='width:200px' src='https://portal.poslovigrada.rs/images/logo.png'>";
var resetPassLimit = 1.8e6; //30 minuta
var podizvodjaci  = ["SeHQZ--1672650353244","IIwY4--1672650358507","TPvkz--1672745311574","e3MHS--1675759749849","eupy8--1676039178890","S5mdP--1677669290493","0ztkS--1672041761145","eexTg--1672041776086","LysTK--1672041750935","ylSnq--1672041756318","KaOzW--1677669275156","QmhV5--1681280323035"];

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
}

function generateId(length) {
	var result           = [];
	var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	var charactersLength = characters.length;
	for ( var i = 0; i < length; i++ ) {
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
				//12 je proizvoljna duzina sifre, da bi se sklonilo 0.00 iz sifre
				var ostatak = sortedObracunArray[j].substring(12,sortedObracunArray[j].length-1);
				var quantityIndex = -1;
				for(var k=0;k<ostatak.length;k++){
					if(ostatak[k]=="0" && ostatak[k+1]=="." && ostatak[k+2]=="0" && ostatak[k+3]=="0"){
						quantityIndex = k+4;
						break;
					}
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

http.listen(process.env.PORT, function(){
	console.log("Poslovi Grada 2024");
	console.log("Server Started");
	console.log("Connecting to database....");
	var dbConnectionStart	=	new Date().getTime();
	client.connect()
	.then(() => {
		console.log("Connected to database in " + eval(new Date().getTime()/1000-dbConnectionStart/1000).toFixed(2)+"s")
		usersDB								=	client.db("Poslovi_Grada_2024").collection('Users');
		naloziDB							=	client.db("Poslovi_Grada_2024").collection('Nalozi');
		nalozi2023DB					=	client.db("Poslovi-Grada").collection('nalozi');
		istorijaNalogaDB			=	client.db("Poslovi_Grada_2024").collection('istorijaNaloga');
		majstoriDB						=	client.db("Poslovi_Grada_2024").collection('Majstori');
		izvestajiDB						=	client.db("Poslovi_Grada_2024").collection('Izvestaji');
		stariIzvestajiDB			=	client.db("Poslovi-Grada").collection('izvestaji-sa-terena');
		pricesDB							=	client.db("Poslovi_Grada_2024").collection('Cenovnik');
		stariCenovnikDB				=	client.db("Poslovi-Grada").collection('Cenovnik');
		pricesHighDB					=	client.db("Poslovi_Grada_2024").collection('CenovnikHigh');
		pricesLowDB						=	client.db("Poslovi_Grada_2024").collection('CenovnikLow');
		stariUcinakMajstoraDB	=	client.db("Poslovi-Grada").collection('UcinakMajstora');
		ucinakMajstoraDB			=	client.db("Poslovi_Grada_2024").collection('ucinakMajstora');
		stariProizvodiDB			=	client.db("Poslovi-Grada").collection('magacin-proizvodi-4');
		proizvodiDB						=	client.db("Poslovi_Grada_2024").collection('magacinProizvodi');
		magacinUlaziDB				=	client.db("Poslovi_Grada_2024").collection('magacinUlazi');
		stariMagacinUlaziDB		=	client.db("Poslovi-Grada").collection('magacin-ulazi-4');
		magacinReversiDB			=	client.db("Poslovi_Grada_2024").collection('magacinReversi');
		stariMagacinReversiDB	=	client.db("Poslovi-Grada").collection('magacin-reversi-4');

		pricesDB.find({}).toArray()
		.then((prices)=>{
			for(var i=0;i<prices.length;i++){
				delete prices[i]._id;
			}
			cenovnik = prices;
			

			//Ubacivanje prijemnica
			/*var prijemnice = fs.readdirSync("./prijemnice");
			for(var i=0;i<prijemnice.length;i++){
				if(!prijemnice[i].includes(".pd")){
					prijemnice.splice(i,1);
					i--;
				}
			}
	    prijemnice.forEach((value, index) =>
				setTimeout(() => {
					var fileContents = fs.readFileSync("./prijemnice/"+value);
			    pdfParse(fileContents)
			    .then((data)=>{
			    	var prijemnicaJson = parsePrijemnica(data.text);
			    	naloziDB.find({broj:prijemnicaJson.nalog.toString()}).toArray()
						.then((nalozi)=>{
							if(nalozi.length==0){
								console.log("NALOG "+prijemnicaJson.nalog.toString()+" DOESNT EXIST!!!!!!!!!!");
							}else{
									var setObj	=	{ $set: {
									obracun: prijemnicaJson.obracun,
									"prijemnica.broj": prijemnicaJson.broj,
									ukupanIznos: prijemnicaJson.ukupanIznos,
									"faktura.penal": prijemnicaJson.penal,
									"prijemnica.datum.datum": prijemnicaJson.datum,
									"prijemnica.datum.datetime": prijemnicaJson.datetime,
									"prijemnica.validanObracun": prijemnicaJson.validanObracun,
									status: "Spreman za fakturisanje",
									"prijemnica.lokacija": "https://poslovi-grada-2024.fra1.digitaloceanspaces.com/prijemnice/"+value
								}};
								naloziDB.updateOne({broj:prijemnicaJson.nalog.toString()},setObj)
								.then((dbResponse)=>{
									console.log(index+". success")
								})
								.catch((error)=>{
									console.log(error);
								})
							}
						})
						.catch((error)=>{
							console.log(error);
							console.log(value);
							console.log("FAILED TO FIND!!!!!!!!!!!!!!!!!!!!!!!");
						})
			    })
			    .catch((error)=>{
			    	console.log(error)
			    	console.log(value)
			    	console.log("FAILED PARSE!!!!!!!!!!!!!!!!!!!!!!!");
			    })
					
				}, index*200)
			)*/
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
		})
		.catch((error)=>{
			logError(error);
		});

		//Ubacivanje novih naloga
		/*var user = {};
		user.name = "Милош Иванковић";
		user.email = "miloscane@gmail.com";

		var imenaNaloga = fs.readdirSync("./novo");
		for(var i=0;i<imenaNaloga.length;i++){
			if(!imenaNaloga[i].includes(".pd")){
				imenaNaloga.splice(i,1);
				i--;
			}
		}
		imenaNaloga.forEach((value, index) =>
			setTimeout(() => {
				var fileContents = fs.readFileSync("./novo/"+value);
		    pdfParse(fileContents)
		    .then((data)=>{
		    	var nalogJson = parseNalog(data.text,user,"https://poslovi-grada-2024.fra1.digitaloceanspaces.com/nalozi/"+value);
		    	naloziDB.find({broj:nalogJson.broj}).toArray()
					.then((nalozi)=>{
						if(nalozi.length==0){
							naloziDB.insertOne(nalogJson)
							.then((dbResponse)=>{
								console.log(index+"Success")
							})
							.catch((error)=>{
		    				console.log(error)
		    				console.log(value)
								console.log("INSERT FAILED!!!!!!!!!!!!!!!!!!!!!!!");
							})
						}else{
		    			console.log(error)
		    			console.log(value)
							console.log("NALOG EXISTS!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
						}
					})
					.catch((error)=>{
		    		console.log(error)
		    		console.log(value)
						console.log("FAILED TO FIND!!!!!!!!!!!!!!!!!!!!!!!");
					})
		    })
		    .catch((error)=>{
		    	console.log(error)
		    	console.log(value)
		    	console.log("FAILED PARSE!!!!!!!!!!!!!!!!!!!!!!!");
		    })
				
			}, index*200)
		)*/

		//kupljenje statusa i majsora
		/*naloziDB.find({}).toArray()
		.then((nalozi)=>{
			var brojArray = [];
			for(var i=0;i<nalozi.length;i++){
				brojArray.push(nalozi[i].broj)
			}
			nalozi2023DB.find({broj:{$in:brojArray}}).toArray()
			.then((nalozi2023)=>{
				nalozi2023.forEach((value, index) =>
					setTimeout(() => {
						var setObj	=	{ $set: {
							statusNaloga: value.statusNaloga,
							majstor: value.majstorNaloga
						}};
						naloziDB.updateOne({broj:value.broj},setObj)
						.then((dbResponse)=>{
							console.log(index+". success")
						})
						.catch((error)=>{
							console.log(error);
						})
					},index*200)
				)
					
			})
			.catch((error)=>{
				console.log(error);
			})
		})
		.catch((error)=>{
			console.log(error);
		})*/


		//kupljenje opisa radova nalog.opisRadova
		/*naloziDB.find({}).toArray()
		.then((nalozi)=>{
			var brojArray = [];
			for(var i=0;i<nalozi.length;i++){
				brojArray.push(nalozi[i].broj)
			}
			nalozi2023DB.find({broj:{$in:brojArray}}).toArray()
			.then((nalozi2023)=>{
				nalozi2023.forEach((value, index) =>
					setTimeout(() => {
						var izvestajJson = {};
						izvestajJson.uniqueId = new Date().getTime() + "--" + generateId(5);
						izvestajJson.nalog = value.broj;
						izvestajJson.datetime = new Date().getTime();
						izvestajJson.datum = getDateAsStringForDisplay(new Date());
						izvestajJson.izvestaj = value.opisRadova;
						izvestajJson.photos = [];
						izvestajJson.user = {
							email: "stariportal@poslovigrada.rs",
							name: "Стари портал"
						}
						izvestajiDB.insertOne(izvestajJson)
						.then((dbResponse)=>{
							console.log(index+". success");
						})
						.catch((error)=>{
							console.log(error)
						})
					},index*200)
				)
					
			})
			.catch((error)=>{
				console.log(error);
			})
		})
		.catch((error)=>{
			console.log(error);
		})*/

		//kupljenje slika
		/*naloziDB.find({}).toArray()
		.then((nalozi)=>{
			var brojArray = [];
			for(var i=0;i<nalozi.length;i++){
				brojArray.push(nalozi[i].broj)
			}
			nalozi2023DB.find({broj:{$in:brojArray}}).toArray()
			.then((nalozi2023)=>{
				nalozi2023.forEach((value, index) =>
					setTimeout(() => {
						var izvestajJson = {};
						izvestajJson.uniqueId = new Date().getTime() + "--" + generateId(5);
						izvestajJson.nalog = value.broj;
						izvestajJson.datetime = new Date().getTime();
						izvestajJson.datum = getDateAsStringForDisplay(new Date());
						izvestajJson.izvestaj = "";
						izvestajJson.photos = [];
						izvestajJson.user = {
							email: "stariportal@poslovigrada.rs",
							name: "Стари портал"
						}
						stariIzvestajiDB.find({uniqueId:value.uniqueId}).toArray()
						.then((izvestaji)=>{
							if(izvestaji.length>0){
								for(var i=0;i<izvestaji.length;i++){
									izvestajJson.izvestaj = izvestajJson.izvestaj+ "<br>&nbsp;<br>"+izvestaji[i].izvestaj;
									if(izvestaji[i].photopath){
										izvestajJson.izvestaj = izvestajJson.izvestaj+"<br><a href=\"https://portal.poslovigrada.rs/"+izvestaji[i].photopath+"\">Слика "+eval(i+1)+"</a>";
									}
								}
								
								izvestajiDB.insertOne(izvestajJson)
								.then((dbResponse)=>{
									console.log(index+". success");
								})
								.catch((error)=>{
									console.log(error)
								})
							}else{
								console.log(index+". NOTHING");
							}
						})
						.catch((error)=>{
							console.log(error)
						})
					},index*200)
				)
					
			})
			.catch((error)=>{
				console.log(error);
			})
		})
		.catch((error)=>{
			console.log(error);
		})*/


		//Cenovnik
		/*var cenovnikString = fs.readFileSync("cenovnik.csv",{encoding:"utf8"});
		var stringArray = cenovnikString.split("\r");
		var jsonArray = [];
		for(var i=0;i<stringArray.length;i++){
			var cenovnikArray = stringArray[i].split(";");
			var cenovnikJson = {};
			cenovnikJson.number = Number(cenovnikArray[0]);
			cenovnikJson.code = cenovnikArray[1].substring( 1, cenovnikArray[1].length - 1 );
			cenovnikJson.name = cenovnikArray[2].substring( 1, cenovnikArray[2].length - 1 );
			cenovnikJson.unit = cenovnikArray[3].substring( 1, cenovnikArray[3].length - 1 );
			cenovnikJson.price = parseFloat(cenovnikArray[5].split(".").join("").replace(",","."));
			jsonArray.push(cenovnikJson);
		}
		pricesDB.insertMany(jsonArray)
		.then((dbResponse)=>{
			console.log(dbResponse)
		})
		.catch((error)=>{
			console.log("INSERT FAILED!!!!!!!!!!!!!!!!!!!!!!!");
		})*/

		//Cenovnik High
		/*var cenovnikString = fs.readFileSync("cenovnikHigh.csv",{encoding:"utf8"});
		var stringArray = cenovnikString.split("\r");
		var jsonArray = [];
		for(var i=0;i<stringArray.length;i++){
			var cenovnikArray = stringArray[i].split(";");
			var cenovnikJson = {};
			cenovnikJson.number = Number(cenovnikArray[0]);
			cenovnikJson.code = cenovnikArray[1].substring( 1, cenovnikArray[1].length - 1 );
			cenovnikJson.name = cenovnikArray[2].substring( 1, cenovnikArray[2].length - 1 );
			cenovnikJson.unit = cenovnikArray[3].substring( 1, cenovnikArray[3].length - 1 );
			cenovnikJson.price = Math.ceil(parseFloat(cenovnikArray[4].split(".").join("").replace(",",".")));
			jsonArray.push(cenovnikJson);
		}
		pricesHighDB.insertMany(jsonArray)
		.then((dbResponse)=>{
			console.log(dbResponse)
		})
		.catch((error)=>{
			console.log("INSERT FAILED!!!!!!!!!!!!!!!!!!!!!!!");
		})*/

		//Cenovnik Low
		/*var cenovnikString = fs.readFileSync("cenovnikLow.csv",{encoding:"utf8"});
		var stringArray = cenovnikString.split("\r");
		var jsonArray = [];
		for(var i=0;i<stringArray.length;i++){
			var cenovnikArray = stringArray[i].split(";");
			var cenovnikJson = {};
			cenovnikJson.number = Number(cenovnikArray[0]);
			cenovnikJson.code = cenovnikArray[1].substring( 1, cenovnikArray[1].length - 1 );
			cenovnikJson.name = cenovnikArray[2].substring( 1, cenovnikArray[2].length - 1 );
			cenovnikJson.unit = cenovnikArray[3].substring( 1, cenovnikArray[3].length - 1 );
			cenovnikJson.price = Math.ceil(parseFloat(cenovnikArray[4].split(".").join("").replace(",",".")));
			jsonArray.push(cenovnikJson);
		}
		pricesLowDB.insertMany(jsonArray)
		.then((dbResponse)=>{
			console.log(dbResponse)
		})
		.catch((error)=>{
			console.log("INSERT FAILED!!!!!!!!!!!!!!!!!!!!!!!");
		})*/


		//Magacin Proizvodi
		/*stariProizvodiDB.find({}).toArray()
		.then((stariProizvodi)=>{
			for(var i=0;i<stariProizvodi.length;i++){
				delete stariProizvodi[i]._id;
				delete stariProizvodi[i].pricelistCode;
			}
			proizvodiDB.insertMany(stariProizvodi)
			.then((dbResponse)=>{
				console.log(dbResponse)
			})
			.catch((error)=>{
				console.log("INSERT FAILED!!!!!!!!!!!!!!!!!!!!!!!");
			})
		})
		.catch((error)=>{
			console.log(error);
		})*/

		//magacin ulazi
		/*stariMagacinUlaziDB.find({}).toArray()
		.then((stariUlazi)=>{
			for(var i=0;i<stariUlazi.length;i++){
				delete stariUlazi[i]._id;
			}
			magacinUlaziDB.insertMany(stariUlazi)
			.then((dbResponse)=>{
				console.log(dbResponse)
			})
			.catch((error)=>{
				console.log("INSERT FAILED!!!!!!!!!!!!!!!!!!!!!!!");
			})
		})
		.catch((error)=>{
			console.log(error);
		})*/

		/*stariMagacinReversiDB.find({}).toArray()
		.then((stariReversi)=>{
			for(var i=0;i<stariReversi.length;i++){
				delete stariReversi[i]._id;
			}
			magacinReversiDB.insertMany(stariReversi)
			.then((dbResponse)=>{
				console.log(dbResponse)
			})
			.catch((error)=>{
				console.log("INSERT FAILED!!!!!!!!!!!!!!!!!!!!!!!");
			})
		})
		.catch((error)=>{
			console.log(error);
		})*/
		

		//User transfer
		/*var users = [
			{
				email: "milica.radun@poslovigrada.rs",
				password: "c0d1a8c4a141dabc7cd188875e8d336a",
				role: "10",
				ime: "Милица Радун",
				kontakt: ["milica.radun@poslovigrada.rs"]
			},
			{
				email: "anja.stefanovic@poslovigrada.rs",
				password: "04c02d4e0b19223e35869bd36af29982",
				role: "10",
				ime: "Ања Стефановић",
				kontakt: ["anja.stefanovic@poslovigrada.rs"]
			},
			{
				email: "hermina.sehic@poslovigrada.rs",
				password: "d8c3dda8c82fd9c01f283f10a5998335",
				role: "10",
				ime: "Хермина Шехић",
				kontakt: ["hermina.sehic@poslovigrada.rs"]
			},
			{
				email: "marija.slijepcevic@poslovigrada.rs",
				password: "e52a48227851f3b835e989b04f82e3c0",
				role: "10",
				ime: "Марија Слијепчевић",
				kontakt: ["marija.slijepcevic@poslovigrada.rs"]
			},
			{
				email: "marija.boskovic@poslovigrada.rs",
				password: "8b8ab6c017b2176faa8e86327ad91877",
				role: "10",
				ime: "Mарија Бошковић",
				kontakt: ["marija.boskovic@poslovigrada.rs"]
			},
			{
				email: "mirjana.korac@poslovigrada.rs",
				password: "e862baba91108180f28ef6e0c10053a3",
				role: "20",
				ime: "Мирјана Кораћ",
				opstine:["ZVEZDARA","PALILULA"],
				kontakt: ["mirjana.korac@poslovigrada.rs"]
			},
			{
				email: "jeca.obradovic@poslovigrada.rs",
				password: "5bffb29d98cfbc748b2b5fc7ab9cc8ab",
				role: "20",
				ime: "Јелена Обрадовић",
				opstine:["STARI GRAD","ČUKARICA","RAKOVICA"],
				kontakt: ["jeca.obradovic@poslovigrada.rs"]
			},
			{
				email: "dragica.garotic@poslovigrada.rs",
				password: "85cc52bd941cff2ee337bab84223a291",
				role: "20",
				ime: "Драгица Гаротић",
				opstine:["NOVI BEOGRAD","ZEMUN"],
				kontakt: ["dragica.garotic@poslovigrada.rs"]
			},
			{
				email: "aleksandar.varagic@poslovigrada.rs",
				password: "d5ae81dea90394a675a6ab7b02a51e8e",
				role: "20",
				ime: "Александар Варагић",
				opstine:["VOŽDOVAC","VRAČAR","SAVSKI VENAC"],
				kontakt: ["aleksandar.varagic@poslovigrada.rs"]
			},
			{
				email: "balkan@poslovigrada.rs",
				password: "ec9fa3ac912b8171d7dde2fb862ea69e",
				role: "30",
				ime: "Балкан",
				nalozi:"SeHQZ--1672650353244",
				kontakt: ["balkan@poslovigrada.rs"]
			},
			{
				email: "koliks@poslovigrada.rs",
				password: "022c1f6c827fa6391d83e81b185b8b85",
				role: "30",
				ime: "Коликс",
				nalozi:"IIwY4--1672650358507",
				kontakt: ["koliks@poslovigrada.rs"]
			},
			{
				email: "alp@poslovigrada.rs",
				password: "9d151d4e0e7edeb436528a4970ce7311",
				role: "30",
				ime: "Алп Комплете",
				nalozi:"e3MHS--1675759749849",
				kontakt: ["office@alp-complete.rs"]
			},
			{
				email: "plavavoda@poslovigrada.rs",
				password: "2bcdc84586dbf52b73defa6c4fe5def1",
				role: "30",
				ime: "Плава вода",
				nalozi:"S5mdP--1677669290493",
				kontakt: ["p.ulamovic@gmail.com"]
			},
			{
				email: "merso@poslovigrada.rs",
				password: "b80edb8c13965d2dba09d1849073cd68",
				role: "30",
				ime: "Мерсо",
				nalozi:"eupy8--1676039178890",
				kontakt: ["vodoinstalaterzlaja2015@gmail.com"]
			},
			{
				email: "premijus@poslovigrada.rs",
				password: "605acd2eeef7bb4795b04b9ecb43aa3d",
				role: "40",
				ime: "Премијус",
				nalozi:"IIwY4--1672650358507",
				kontakt: ["premijus@poslovigrada.rs"]
			}
		]

		usersDB.insertMany(users)
		.then((dbResponse)=>{
			console.log(dbResponse)
		})
		.catch((error)=>{
			console.log("INSERT FAILED!!!!!!!!!!!!!!!!!!!!!!!");
		})*/

















	})
	.catch(error => {
		console.log('Failed to connect to database');
		logError(error);
	});
});




server.get('/',async (req,res)=>{
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
				var ukupnoSpremnihNaloga = 0
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
		}else if(Number(req.session.user.role)==20){
			res.redirect("/dispecer/otvoreniNalozi")
		}else if(Number(req.session.user.role)==30){
			res.redirect("/podizvodjac/otvoreniNalozi")
		}else if(Number(req.session.user.role)==40){
			res.redirect("/spremniNalozi")
		}else if(Number(req.session.user.role)==50){
			res.redirect("/magacioner/stanje")
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
				res.render("messageNotLoggedIn",{
					pageTitle: "Грешка",
					message: "<div class=\"text\">Не постоји корисник са унетом електронском поштом.</div><div class=\"button\"><a href=\"/login\" onclick=\"loadGif()\">Покушај поново</a></div>"
				});
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

server.get('/sviNalozi',async (req,res)=>{
	if(req.session.user){
		if(Number(req.session.user.role)==10){
			res.render("administracija/listaNaloga",{
				pageTitle:"Сви налози",
				user: req.session.user
			});
		}else{
			res.redirect("/")
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
									console.log(nalogJson);
									fs.unlinkSync("./processing/"+filename+".pdf");
									naloziDB.find({broj:nalogJson.broj}).toArray()
									.then((nalozi)=>{
										if(nalozi.length==0){
											naloziDB.insertOne(nalogJson)
											.then((dbResponse)=>{
												res.redirect("/nalog/"+nalogJson.broj);
											})
											.catch((error)=>{
												logError(error);
												res.render("message",{
													pageTitle: "Програмска грешка",
													user: req.session.user,
													message: "<div class=\"text\">Дошло је до грешке у бази податка 879.</div>"
												});
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

server.get('/nalog/:broj',async (req,res)=>{
	if(req.session.user){
		if(Number(req.session.user.role)==10 || Number(req.session.user.role)==20 || Number(req.session.user.role)==30){
			//administracija, dispeceri, podizvodjaci
			naloziDB.find({broj:req.params.broj.toString()}).toArray()
			.then((nalozi) => {
				if(nalozi.length>0){
					majstoriDB.find({}).toArray()
					.then((majstori)=>{
						istorijaNalogaDB.find({broj:req.params.broj.toString()}).toArray()
						.then((istorijat)=>{
							izvestajiDB.find({nalog:req.params.broj.toString()}).toArray()
							.then((izvestaji)=>{
								ucinakMajstoraDB.find({brojNaloga:req.params.broj.toString()}).toArray()
								.then((ucinci)=>{
									if(Number(req.session.user.role)==10){
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
											logError(error);
											res.render("message",{
												pageTitle: "Грешка",
												message: "<div class=\"text\">Налог није додељен вама.</div>",
												user: req.session.user
											});
										}
									}else{
										logError(error);
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
		upload(req, res, function (error) {
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
		if(Number(req.session.user.role)==10 || Number(req.session.user.role)==20 || Number(req.session.user.role)==30){
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
					if(nalogJson.status==nalogJson.stariNalog.statusNaloga && nalogJson.majstor==nalogJson.stariNalog.majstor && JSON.stringify(nalogJson.kategorijeRadova)==JSON.stringify(nalogJson.stariNalog.kategorijeRadova) && JSON.stringify(nalogJson.obracun)==JSON.stringify(nalogJson.stariNalog.obracun)){
						//nema izmena na nalogu
						if(izvestajJson.izvestaj!="" || izvestajJson.photos.length>0){
							//ima izvestaja
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
								if(Number(req.session.user.role)==30){
									var ukupanIznos = 0;
									for(var i=0;i<nalogJson.obracun;i++){
										for(var j=0;j<cenovnik.length;j++){
											if(nalogJson.obracun[i].code==cenovnik[i].code){
												ukupanIznos = ukupanIznos + cenovnik[i].price*nalogJson.obracun[i].quantity;
												break;
											}
										}
									}
									var setObj	=	{ $set: {
										statusNaloga: nalogJson.status,
										majstor: nalogJson.majstor,
										obracun: nalogJson.obracun,
										kategorijeRadova: nalogJson.kategorijeRadova,
										ukupanIznos: ukupanIznos,
										izmenio: req.session.user
									}};
								}else{

								}
								
								naloziDB.updateOne({broj:nalogJson.broj},setObj)
								.then((dbResponse2) => {
									
									nalogJson.stariNalog.izmenio = req.session.user;
									nalogJson.stariNalog.datetime = new Date().getTime();
									istorijaNalogaDB.insertOne(nalogJson.stariNalog)
									.then((dbResponse3)=>{
										res.redirect("/nalog/"+nalogJson.broj);
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
							for(var i=0;i<nalogJson.obracun;i++){
								for(var j=0;j<cenovnik.length;j++){
									if(nalogJson.obracun[i].code==cenovnik[i].code){
										ukupanIznos = ukupanIznos + cenovnik[i].price*nalogJson.obracun[i].quantity;
										break;
									}
								}
							}
							var setObj	=	{ $set: {
								statusNaloga: nalogJson.status,
								majstor: nalogJson.majstor,
								obracun: nalogJson.obracun,
								kategorijeRadova: nalogJson.kategorijeRadova,
								ukupanIznos: ukupanIznos,
								izmenio: req.session.user
							}};
							naloziDB.updateOne({broj:nalogJson.broj},setObj)
							.then((dbResponse2) => {
								
								nalogJson.stariNalog.izmenio = req.session.user;
								nalogJson.stariNalog.datetime = new Date().getTime();
								istorijaNalogaDB.insertOne(nalogJson.stariNalog)
								.then((dbResponse3)=>{
									res.redirect("/nalog/"+nalogJson.broj);
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
		if(Number(req.session.user.role)==10){
			res.render("administracija/administracijaMajstora",{
				pageTitle:"Администрација мајстора",
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

server.get('/ucinakPodizvodjaca',async (req,res)=>{
	if(req.session.user){
		if(Number(req.session.user.role)==10){
			res.render("administracija/ucinakPodizvodjaca",{
				pageTitle:"Учинак подизвођача",
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
							if(podizvodjaci.indexOf(majstori[i].uniqueId)<0){
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


server.get('/dispecer/otvoreniNalozi',async (req,res)=>{
	if(req.session.user){
			if(Number(req.session.user.role)==20){
				naloziDB.find({radnaJedinica:{$in:req.session.user.opstine},statusNaloga:{$nin:["Završeno","Nalog u Stambenom","Storniran","Vraćen","Spreman za fakturisanje","Fakturisan","Spreman za obračun"]}}).toArray()
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

server.get('/dispecer/zavrseniNalozi',async (req,res)=>{
	if(req.session.user){
			if(Number(req.session.user.role)==20){
				naloziDB.find({radnaJedinica:{$in:req.session.user.opstine},statusNaloga:{$in:["Završeno"]}}).toArray()
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

server.post('/pretragaNalogaPoAdresi', async (req, res)=> {
	if(req.session.user){
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
					delete nalozi[i].obracun;
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

server.get('/podizvodjac/obradjeniNalozi',async (req,res)=>{
	if(req.session.user){
		if(Number(req.session.user.role)==30){
			naloziDB.find({majstor:req.session.user.nalozi,statusNaloga:"Fakturisan"}).toArray()//OVDE POTREBAN FILTER AKO JE PODIZVODJAC FAKTURISAO NE PRIKAZUJ
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
					delete nalozi[i].ukupanIznos;
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

io.on('connection', function(socket){
	socket.on('listaNalogaAdministracija', function(startTime,endTime){
		var dbFindStart	=	new Date().getTime();
		naloziDB.find({}).toArray()
		.then((nalozi) => {
			var naloziToSend	=	[];
			if(startTime && endTime){
				for(var i=0;i<nalozi.length;i++){
					var nalogDate	=	new Date(Number(nalozi[i].uniqueId.split("--")[1]));
					var nalogTime	=	new Date(getDateAsStringForInputObject(nalogDate)).getTime();
					delete nalozi[i].zahtevalac;
					delete nalozi[i].vrstaRada;
					delete nalozi[i].rokPocetkaIzvodjenjaRadova;
					delete nalozi[i].fakturisanje;
					delete nalozi[i].radIzvrsen;
					delete nalozi[i].radPregledan;
					delete nalozi[i].datumIspostavljanjaNarudzbenice;
					delete nalozi[i].brojNarudzbenice;
					delete nalozi[i].datumOdlaganja;
					delete nalozi[i].razlogOdlaganja;
					delete nalozi[i].opisKvara;
					delete nalozi[i].opisRadova;
					delete nalozi[i].opisRadovaArr;
					delete nalozi[i].statusOdMajstora;
					delete nalozi[i]._id;
					delete nalozi[i].uniqueId;
					if(nalogTime>=startTime && nalogTime<=endTime){
						naloziToSend.push(nalozi[i]);
					}
				}
			}else{
				naloziToSend = nalozi;
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
				if(startTime!="" && endTime!=""){
					var datetime = Number(nalogToPush.faktura.datum.datetime);
					if(datetime>=startTime && datetime<=endTime){
						naloziToSend.push(nalogToPush)
					}
				}else if(odBroja!="" && doBroja!=""){
					if(nalogToPush.samoBroj == 0){
						warnings.push("Nije moguce odrediti broj fakture za nalog "+nalogToPush.broj+", broj fakture"+nalogToPush.brojFakture);
					}else{
						if(Number(nalogToPush.samoBroj)>=Number(odBroja) && Number(nalogToPush.samoBroj)<=Number(doBroja)){
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

			for(var i=0;i<naloziToSend.length;i++){
				if(isNaN(parseFloat(naloziToSend[i].ukupanIznos))){
					warnings.push("Nalog "+ naloziToSend.broj +" nema definisan iznos ("+naloziToSend[i].ukupanIznos+").")
				}
				var iznosNaloga = isNaN(parseFloat(naloziToSend[i].ukupanIznos)) ? 0 : parseFloat(naloziToSend[i].ukupanIznos);
				statistika.ukupanIznos = statistika.ukupanIznos + iznosNaloga
				if(iznosNaloga>=500000){
					statistika.ukupnoPrekoPolaMil++;
				}else{
					statistika.ukupanPdv = statistika.ukupanPdv + iznosNaloga*0.2;
				}
			}

			naloziToSend = naloziToSend.sort((a, b) => {
				if (a.samoBroj < b.samoBroj) {
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



