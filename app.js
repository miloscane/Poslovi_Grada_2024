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
        cb(null, new Date().getTime().toString() +".jpg")
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
	var errorJSON = {};
	errorJSON.datetime = new Date().getTime();
	errorJSON.date = new Date().getFullYear()+"."+eval(new Date().getMonth()+1)+"."+new Date().getDate();
	errorJSON.error = error.toString()
	errorJSON.jsonerror = error;
	errorJSON.errorstack = error.stack;
	errorJSON.errormessage = error.message;
	errorDB.insertOne(errorJSON)
	.then((dbResponse)=>{
		//console.log(dbResponse)
	}).catch((err)=>{
		console.log(err);
	})
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


		nalozi2023DB					=	client.db("Poslovi-Grada").collection('nalozi');
		stariIzvestajiDB			=	client.db("Poslovi-Grada").collection('izvestaji-sa-terena');
		stariCenovnikDB				=	client.db("Poslovi-Grada").collection('Cenovnik');
		stariUcinakMajstoraDB	=	client.db("Poslovi-Grada").collection('UcinakMajstora');
		stariProizvodiDB			=	client.db("Poslovi-Grada").collection('magacin-proizvodi-4');
		stariMagacinUlaziDB		=	client.db("Poslovi-Grada").collection('magacin-ulazi-4');
		stariMagacinReversiDB	=	client.db("Poslovi-Grada").collection('magacin-reversi-4');

		/*naloziDB.find({}).toArray()
		.then((nalozi)=>{
			for(var i=0;i<nalozi.length;i++){
				if(podizvodjaci.indexOf(nalozi[i].majstor)>=0 && nalozi[i].statusNaloga=="Fakturisan"){
					console.log("NADJENO "+nalozi[i].broj)
				}else{
					console.log("...")
				}

			}
		})
		.catch((error)=>{
			console.log(error)
		})*/

		pricesDB.find({}).toArray()
		.then((prices)=>{
			for(var i=0;i<prices.length;i++){
				delete prices[i]._id;
			}
			cenovnik = prices;
			console.log("Cenovnik inicijalizovan");
			

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
									statusNaloga: "Spreman za fakturisanje",
									"prijemnica.lokacija": "https://poslovi-grada-2024.fra1.digitaloceanspaces.com/prijemnice/"+value
								}};
								naloziDB.updateOne({broj:prijemnicaJson.nalog.toString()},setObj)
								.then((dbResponse)=>{
									console.log(index+"/"+prijemnice.length+". success")
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

			/*nalozi2023DB.find({}).toArray()
			.then((nalozi2023)=>{
				naloziDB.find({}).toArray()
				.then((nalozi)=>{
					var noviUgovor = 0;
					for(var i=0;i<nalozi2023.length;i++){
						for(var j=0;j<nalozi.length;j++){
							if(nalozi2023[i].broj==nalozi[j].broj){
								nalozi2023.splice(i,1);
								i--;
								noviUgovor++;
							}
						}
					}
					var ukupanIznos = 0;
					for(var i=0;i<nalozi2023.length;i++){
						if(!isNaN(parseFloat(nalozi2023[i].ukupanIznos))){
							ukupanIznos = ukupanIznos + parseFloat(nalozi2023[i].ukupanIznos);
						}else{
							//console.log("Nedefinisan iznos za nalog "+nalozi2023[i].broj+" , iznos: "+nalozi2023[i].ukupanIznos+" RSD");
						}
					}
					//console.log("Nalozi iz novog ugovora: " + noviUgovor)
					console.log("Iznos starog ugovora:" + brojSaRazmacima(ukupanIznos));

					var ukupanIznosNovogUgovoraNaDanPrelaza = 0;
					for(var i=0;i<nalozi.length;i++){
						if(nalozi[i].datum.datum.includes("22.02.")){
							if(!isNaN(parseFloat(nalozi[i].ukupanIznos))){
								ukupanIznosNovogUgovoraNaDanPrelaza = ukupanIznosNovogUgovoraNaDanPrelaza + parseFloat(nalozi[i].ukupanIznos);
							}else{
								//console.log("Nedefinisan iznos za nalog "+nalozi[i].broj+" , iznos: "+nalozi[i].ukupanIznos +" RSD");
							}	
						}
					}
					console.log("Iznos naloga NOVOG UGOVORA na dan prelaza na novi ugovor:" + brojSaRazmacima(ukupanIznosNovogUgovoraNaDanPrelaza));

					var ukupanIznosStarogUgovoraNaDanPrelaza = 0;
					for(var i=0;i<nalozi2023.length;i++){
						if(nalozi2023[i].datum.includes("22.02.")){
							if(!isNaN(parseFloat(nalozi2023[i].ukupanIznos))){
								ukupanIznosStarogUgovoraNaDanPrelaza = ukupanIznosStarogUgovoraNaDanPrelaza + parseFloat(nalozi2023[i].ukupanIznos);
							}else{
								//console.log("Nedefinisan iznos za nalog "+nalozi2023[i].broj+" , iznos: "+nalozi2023[i].ukupanIznos +" RSD");
							}	
						}
					}
					console.log("Iznos naloga STAROG UGOVORA na dan prelaza na novi ugovor:" + brojSaRazmacima(ukupanIznosStarogUgovoraNaDanPrelaza));
					
					var ukupanFebruarZaPDV = 0;
					var ukupanFebruarBezPDV = 0;
					var pocetakPDV = new Date("2024-02-01");
					var krajPDV = new Date("2024-02-29");
					for(var i=0;i<nalozi.length;i++){
						if(nalozi[i].prijemnica.datum.datetime){
							if(Number(nalozi[i].prijemnica.datum.datetime)>=pocetakPDV.getTime() && Number(nalozi[i].prijemnica.datum.datetime)<=krajPDV.getTime()){
								if(!isNaN(parseFloat(nalozi[i].ukupanIznos))){
									if(parseFloat(nalozi[i].ukupanIznos)>500000){
										ukupanFebruarBezPDV = ukupanFebruarBezPDV + parseFloat(nalozi[i].ukupanIznos);
									}else{
										ukupanFebruarZaPDV = ukupanFebruarZaPDV + parseFloat(nalozi[i].ukupanIznos);
									}
								}else{
									console.log("Nedefinisan iznos za nalog "+nalozi[i].broj+" , iznos: "+nalozi[i].ukupanIznos +" RSD");
								}	
							}	
						}
						
					}
					console.log("------------------------------------------------------------")
					console.log("Novi Ugovor Februar NEOPOREZIVO: " + brojSaRazmacima(ukupanFebruarBezPDV));
					console.log("Novi Ugovor Februar OPOREZIVO: " + brojSaRazmacima(ukupanFebruarZaPDV));
					
					//1834-3202
					var ukupanFebruarZaPDVStari = 0;
					var ukupanFebruarBezPDVStari = 0;
					var pocetakPDV = new Date("2024-02-01");
					var krajPDV = new Date("2024-02-29");
					for(var i=0;i<nalozi2023.length;i++){
						var datumPrometaTemp = nalozi2023[i].radPregledan;
						var datumPrometa = new Date(datumPrometaTemp.split(".")[2]+"-"+datumPrometaTemp.split(".")[1]+"-"+datumPrometaTemp.split(".")[0])
						if(datumPrometa instanceof Date){
							if(datumPrometa.getTime()>=pocetakPDV.getTime() && datumPrometa.getTime()<=krajPDV.getTime()){
								if(!isNaN(parseFloat(nalozi2023[i].ukupanIznos))){
									if(parseFloat(nalozi2023[i].ukupanIznos)>500000){
										ukupanFebruarBezPDVStari = ukupanFebruarBezPDVStari + parseFloat(nalozi2023[i].ukupanIznos);
									}else{
										ukupanFebruarZaPDVStari = ukupanFebruarZaPDVStari + parseFloat(nalozi2023[i].ukupanIznos);
									}
								}else{
									console.log("Nedefinisan iznos za nalog "+nalozi2023[i].broj+" , iznos: "+nalozi2023[i].ukupanIznos +" RSD");
								}	
							}
							
						}else{
							console.log("Nije dobar datum prometa za nalog "+nalozi2023[i].broj+", "+nalozi2023[i].radPregledan)
						}						
					}
					console.log("------------------------------------------------------------")
					console.log("Stari Ugovor Februar NEOPOREZIVO: " + brojSaRazmacima(ukupanFebruarBezPDVStari));
					console.log("Stari Ugovor Februar OPOREZIVO: " + brojSaRazmacima(ukupanFebruarZaPDVStari));
					console.log("UKUPNO:")
					console.log("------------------------------------------------------------")
					console.log("Februar NEOPOREZIVO: " + brojSaRazmacima(ukupanFebruarBezPDVStari+ukupanFebruarBezPDV));
					console.log("Februar OPOREZIVO: " + brojSaRazmacima(ukupanFebruarZaPDVStari+ukupanFebruarZaPDV));
					//console.log("UKUPNOOOO:" + brojSaRazmacima(ukupanFebruarBezPDVStari+ukupanFebruarBezPDV+ukupanFebruarZaPDVStari+ukupanFebruarZaPDV))
				})
				.catch((error)=>{
					console.log(error);
				})
			})
			.catch((error)=>{
				console.log(error);
			})*/


			/*naloziDB.find({}).toArray()
			.then((nalozi)=>{
				var naloziBezIznosa = [];
				for(var i=0;i<nalozi.length;i++){
					if(nalozi[i].obracun.length>0 && parseFloat(nalozi[i].ukupanIznos)==0){
						naloziBezIznosa.push(nalozi[i].broj)
					}
				}
				console.log(naloziBezIznosa)
				naloziDB.find({broj:{$in:naloziBezIznosa}}).toArray()
				.then((naloziZaIspravku)=>{
					naloziZaIspravku.forEach((value, index) =>
						setTimeout(() => {
							var ukupanIznos = 0;
							for(var i=0;i<value.obracun.length;i++){
								for(var j=0;j<cenovnik.length;j++){
									if(value.obracun[i].code==cenovnik[j].code){
										ukupanIznos = ukupanIznos + parseFloat(cenovnik[j].price)*parseFloat(value.obracun[i].quantity);
										break;
									}
								}
							}
							var setObj	=	{ $set: {
								ukupanIznos: ukupanIznos
							}};
							naloziDB.updateOne({broj:value.broj},setObj)
							.then((dbResponse)=>{
								console.log(index+". success")
							})
							.catch((error)=>{
								console.log(error);
							})
							
						},index*200))
				})
				.catch((error)=>{
					console.log(error)
				})
			})
			.catch((error)=>{
				console.log(error)
			})*/

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

		/*errorDB.find({}).toArray()
		.then((errors)=>{
			console.log(errors)
		})
		.catch((error)=>{
			console.log(error)
		})*/

		/*errorDB.deleteMany({error:{$regex:"MongoInvalidArgumentError:"}})
		.then((dbResponse)=>{
			console.log(dbResponse)
		})
		.catch((error)=>{
			console.log(error)
		})*/
 
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

		//Testiranje citanja naloga
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
		    	console.log(nalogJson.zahtevalac)
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
		

		/*naloziDB.find({statusNaloga:"Fakturisan"}).toArray()
		.then((nalozi) => {
			var odBroja = 3202;
			var doBroja = 3459;
			var naloziToExport	=	[];
			for(var i=0;i<nalozi.length;i++){
				if(nalozi[i].faktura.samoBroj==0 || isNaN(Number(nalozi[i].faktura.samoBroj))){
					warnings.push("Nije moguce odrediti broj fakture za nalog "+nalozi[i].broj+", broj fakture"+nalozi[i].brojFakture);
				}else{
					if(Number(nalozi[i].faktura.samoBroj)>=Number(odBroja) && Number(nalozi[i].faktura.samoBroj)<=Number(doBroja)){
						naloziToExport.push(nalozi[i])
					}
				}
			}

			naloziToExport = naloziToExport.sort((a, b) => {
				if (a.faktura.samoBroj < b.faktura.samoBroj) {
					return -1;
				}
			});

			var csvString = "Broj Naloga,Broj Fakture,Iznos,PDV,Iznos PDVa,Datum PDV\r\n";
			for(var i=0;i<naloziToExport.length;i++){
				var pdv = parseFloat(naloziToExport[i].ukupanIznos)>=500000 ? 0 : 20; 
				var iznosPdv = parseFloat(naloziToExport[i].ukupanIznos)*pdv/100;
				var datumPdv = naloziToExport[i].faktura.pdv == "35" ? naloziToExport[i].prijemnica.datum.datum : "Datum Slanja"
				csvString += naloziToExport[i].broj+","+naloziToExport[i].faktura.broj+","+naloziToExport[i].ukupanIznos+","+pdv+","+iznosPdv+","+datumPdv+"\r\n"
			}
			fs.writeFileSync("./Export-"+odBroja+"-"+doBroja+".csv",csvString,"utf8");
			console.log("Wrote "+ naloziToExport.length)
		})
		.catch((error)=>{
			console.log(error)
		})*/


		/*naloziDB.find({}).toArray()
		.then((nalozi)=>{
			var naloziToExport = [];
			for(var i=0;i<nalozi.length;i++){
				if(nalozi[i].faktura.broj){
					if(nalozi[i].faktura.broj.length>3){
						if(nalozi[i].prijemnica.datum.datum){
							if(nalozi[i].prijemnica.datum.datum.includes(".02.2024")){
								naloziToExport.push(nalozi[i])
							}
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

			for(var i=0;i<naloziToExport.length;i++){
				//console.log(naloziToExport[i].statusNaloga)
			}

			var csvString = "Datum,Broj Fakture,Konto,Stranka,Prazno,Prazno,Datum,Datum,Prazno,Prazno,Duguje,Potrazuje,Prazno,Prazno\r\n";
			for(var i=0;i<naloziToExport.length;i++){
				var iznosBezPDVa = parseFloat(naloziToExport[i].ukupanIznos);
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
				csvString+="NAPOMENA:"+" / Broj fakture: "+problemNalozi[i].faktura.broj+" / Broj naloga: "+problemNalozi[i].broj+" / Problem: "+problemNalozi[i].problem+"\r\n";
			}
			fs.writeFileSync("./Minimax-02-2024.csv",csvString,"utf8");
			console.log("Written ")
		})
		.catch((error)=>{
			console.log(error)
		})*/


		











	})
	.catch(error => {
		console.log('Failed to connect to database');
		logError(error);
	});
});


/*server.get('/test', async (req,res)=>{
	console.log("-----------------------------------------------")
	console.log("-----------------------------------------------")
	naloziDB.find({}).toArray()
		.then((nalozi)=>{
			var ukupanIznosUgovora = 0;
			var ukupnoNalogaSaIznosom = 0;
			for(var i=0;i<nalozi.length;i++){
				var iznosNaloga = isNaN(parseFloat(nalozi[i].ukupanIznos)) ? -1 : parseFloat(nalozi[i].ukupanIznos);
				if(iznosNaloga>0){
					ukupanIznosUgovora = ukupanIznosUgovora + iznosNaloga;
					ukupnoNalogaSaIznosom++;
				}
			}
			console.log("ANALITIKA UGOVORA:")
			console.log("Ukupno naloga: "+ nalozi.length);
			console.log("Ukupno naloga sa iznosom: "+ ukupnoNalogaSaIznosom);
			console.log("Vrednost ugovora: "+ brojSaRazmacima(ukupanIznosUgovora));
			console.log("-----------------------------------------------")
			console.log("-----------------------------------------------")
			var naloziPodizvodjaca = [];
			for(var i=0;i<nalozi.length;i++){
				if(podizvodjaci.indexOf(nalozi[i].majstor)>=0 && nalozi[i].obracun.length>0){
					naloziPodizvodjaca.push(nalozi[i])
				}
			}
			console.log("ANALITIKA PODIZVODJACA:")
			console.log("Nadjeno " + nalozi.length + " od cega su podizvodjaci " + naloziPodizvodjaca.length);
			console.log("Prikaz analitike za " + naloziPodizvodjaca.length + " naloga");
			var ukupnoPG = 0;
			var ukupnoPodizvodjaca = 0;
			for(var i=0;i<naloziPodizvodjaca.length;i++){
				var iznosNaloga = isNaN(parseFloat(naloziPodizvodjaca[i].ukupanIznos)) ? -1 : parseFloat(naloziPodizvodjaca[i].ukupanIznos);
				if(iznosNaloga==-1){
					console.log("Nisam mogao da interpretiram cifru za nalog "+naloziPodizvodjaca[i].broj +", iznos: "+naloziPodizvodjaca[i].ukupanIznos);
				}
				ukupnoPG = ukupnoPG + iznosNaloga;
				var cenovnikPodizvodjaca	=	[];
				if(naloziPodizvodjaca[i].majstor=="SeHQZ--1672650353244" || naloziPodizvodjaca[i].majstor=="IIwY4--1672650358507"){
					cenovnikPodizvodjaca = cenovnikHigh;
				}else{
					cenovnikPodizvodjaca = cenovnikLow;
				}

				var iznosNalogaPodizvodjaca = 0;
				for(var j=0;j<naloziPodizvodjaca[i].obracun.length;j++){
					for(var k=0;k<cenovnikPodizvodjaca.length;k++){
						if(naloziPodizvodjaca[i].obracun[j].code == cenovnikPodizvodjaca[k].code){
							iznosNalogaPodizvodjaca = iznosNalogaPodizvodjaca + parseFloat(naloziPodizvodjaca[i].obracun[j].quantity)*parseFloat(cenovnikPodizvodjaca[k].price)
						}
					}
				}
				ukupnoPodizvodjaca = ukupnoPodizvodjaca + iznosNalogaPodizvodjaca
			}
			console.log("Ukupno novca Poslovi Grada: " + brojSaRazmacima(ukupnoPG));
			console.log("Od toga podizvodjaci: " + brojSaRazmacima(ukupnoPodizvodjaca));
			var procenat = 100-((ukupnoPodizvodjaca)/ukupnoPG)*100;
			console.log("Procentna dobit: " + procenat.toFixed(2)+"%");
			console.log("-----------------------------------------------");
			console.log("-----------------------------------------------");
			console.log("ANALITIKA MATERIJALA:")

			magacinReversiDB.find({}).toArray()
			.then((reversi)=>{
				proizvodiDB.find({}).toArray()
				.then((proizvodi)=>{
					var ukupnoPG = 0;
					var iznosNalogaSaReversima = 0;
					var brojNaloga = 0;
					var naloziBezMaterijala = 0;
					var materijalBezCene = 0;
					var ukupnoMaterijal = 0;
					for(var i=0;i<nalozi.length;i++){
						if(podizvodjaci.indexOf(nalozi[i].majstor)<0){
							var iznosNaloga = isNaN(parseFloat(nalozi[i].ukupanIznos)) ? -1 : parseFloat(nalozi[i].ukupanIznos);
							if(iznosNaloga==-1){
								console.log("Nisam mogao da interpretiram cifru za nalog "+nalozi[i].broj +", iznos: "+nalozi[i].ukupanIznos);
							}else{
								ukupnoPG = ukupnoPG + iznosNaloga;
								brojNaloga++;
							}
							var reversFound = false;
							var materijalPoNalogu = 0;
							for(var j=0;j<reversi.length;j++){
								if(reversi[j].nalog==nalozi[i].broj){
									reversFound = true;
									for(var k=0;k<reversi[j].zaduzenje.length;k++){
										for(var l=0;l<proizvodi.length;l++){
											if(proizvodi[l].code==reversi[j].zaduzenje[k].code){
												var cenaMaterijala = isNaN(parseFloat(proizvodi[l].price)) ? -1 : parseFloat(proizvodi[l].price);
												if(cenaMaterijala<=0){
													materijalBezCene++;
												}else{
													var uzeto		=	isNaN(parseFloat(reversi[j].zaduzenje[k].quantity)) ? 0 : parseFloat(reversi[j].zaduzenje[k].quantity);
													var vraceno	=	isNaN(parseFloat(reversi[j].zaduzenje[k].quantity2)) ? 0 : parseFloat(reversi[j].zaduzenje[k].quantity2);
													var utroseno = uzeto - vraceno;
													materijalPoNalogu = materijalPoNalogu + utroseno*cenaMaterijala;
												}
											}
										}
									}
								}
							}
							if(reversFound){
								ukupnoMaterijal = ukupnoMaterijal + materijalPoNalogu;
								iznosNalogaSaReversima = iznosNalogaSaReversima + iznosNaloga;
							}else{
								naloziBezMaterijala++;
							}	
						}
					}
					console.log("Ukupno naloga sa iznosom: "+brojNaloga);
					console.log("Ukupan iznos: "+brojSaRazmacima(ukupnoPG));
					console.log("Nalozi bez reversa: "+naloziBezMaterijala);
					console.log("Broj stavki bez definisane cene materijala: "+materijalBezCene);
					console.log("Ukupan iznos naloga koji imaju reverse: " + brojSaRazmacima(iznosNalogaSaReversima));
					console.log("Ukupan utrosen materijal: " + brojSaRazmacima(ukupnoMaterijal));
					console.log("Procentni gubitak na materijalu: " + eval(ukupnoMaterijal/iznosNalogaSaReversima*100).toFixed(2)+"%");
					res.send("Ok");
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
			res.send("bad");
		})
});*/

server.get('/',async (req,res)=>{
	if(req.session.user){
		if(Number(req.session.user.role)==5){
			res.redirect("/stefan/naslovna");
		}else if(Number(req.session.user.role)==10){
			res.redirect("/administracija");
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
											naloziDB.insertOne(nalogJson)
											.then((dbResponse)=>{
												usersDB.find({}).toArray()
												.then((korisnici)=>{
													var emails = [];
													for(var i=0;i<korisnici.length;i++){
														if(korisnici[i].opstine){
															if(korisnici[i].opstine.indexOf(nalogJson.radnaJedinica)>=0){
																if(korisnici[i].hasOwnProperty("kontakt")){
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
															}
														}
													}

													var mailOptions = {
														from: '"ВиК Портал Послова Града" <admin@poslovigrada.rs>',
														to: emails.join(","),
														subject: 'Додељен вам је нови налог број '+nalogJson.broj,
														html: 'Поштовани ,<br>Додељен вам је нови ВиК налог на порталу послова града.<br>Број налога: '+nalogJson.broj+'<br>Радна јединица: '+nalogJson.radnaJedinica+'<br>Адреса: <a href=\"https://www.google.com/maps/search/?api=1&query='+nalogJson.adresa.replace(/,/g, '%2C').replace(/ /g, '+')+'\">'+nalogJson.adresa+'</a><br>Захтевалац: '+ nalogJson.zahtevalac+'<br>Опис проблема: '+nalogJson.opis+'<br><a href=\"'+process.env.siteurl+'/nalog/'+nalogJson.broj+'\">Отвори налог на порталу</a>',
													};

													transporter.sendMail(mailOptions, (error, info) => {
														if (error) {
															logError(error);
															res.redirect("/nalog/"+nalogJson.broj);
														}else{
															res.redirect("/nalog/"+nalogJson.broj);
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

server.get('/administracija/specifikacijePodizvodjaca',async (req,res)=>{
	if(req.session.user){
		if(Number(req.session.user.role)==10){
			specifikacijePodizvodjacaDB.find({}).toArray()
			.then((specifikacije)=>{
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
								if(nalogJson.majstor==nalogJson.stariNalog.majstor){
									res.redirect("/nalog/"+nalogJson.broj);
								}else{
									majstoriDB.find({uniqueId:nalogJson.majstor}).toArray()
									.then((majstori)=>{
										if(majstori.length>0){
											if(majstori[i].hasOwnProperty("kontakt")){
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
										if(nalogJson.majstor==nalogJson.stariNalog.majstor){
											res.redirect("/nalog/"+nalogJson.broj);
										}else{
											majstoriDB.find({uniqueId:nalogJson.majstor}).toArray()
											.then((majstori)=>{
												if(majstori.length>0){
													if(majstori[i].hasOwnProperty("kontakt")){
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
				nalog: json.nalog
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

server.get('/portalStambenoNalozi', async (req, res)=> {
	console.log("GET od portala!")
	console.log(req.body);
	console.log("-----------------------------");
	res.send("Ok i get you");
});

server.post('/portalStambenoNalozi', async (req, res)=> {
	console.log("POST od portala!")
	console.log(req.body);
	console.log("-----------------------------");
	res.send("Ok i get it you posted a thing");
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
				nalogToPush.prijemnica = nalozi[i].prijemnica;
				if(startTime!="" && endTime!=""){
					var datetime = Number(nalogToPush.faktura.datum.datetime);
					if(datetime>=startTime && datetime<=endTime){
						naloziToSend.push(nalogToPush)
					}
				}else if(odBroja!="" && doBroja!=""){
					if(nalogToPush.samoBroj == 0){
						warnings.push("Nije moguce odrediti broj fakture za nalog "+nalogToPush.broj+", broj fakture"+nalogToPush.brojFakture);
					}else{
						if(Number(nalogToPush.faktura.samoBroj)>=Number(odBroja) && Number(nalogToPush.faktura.samoBroj)<=Number(doBroja)){
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

			for(var i=0;i<naloziToSend.length;i++){
				if(isNaN(parseFloat(naloziToSend[i].ukupanIznos))){
					warnings.push("Nalog "+ naloziToSend.broj +" nema definisan iznos ("+naloziToSend[i].ukupanIznos+").")
				}
				var iznosNaloga = isNaN(parseFloat(naloziToSend[i].ukupanIznos)) ? 0 : parseFloat(naloziToSend[i].ukupanIznos);
				statistika.ukupanIznos = statistika.ukupanIznos + iznosNaloga
				if(iznosNaloga>=500000){
					statistika.ukupnoPrekoPolaMil++;
					statistika.neoporezivo	= statistika.neoporezivo + parseFloat(naloziToSend[i].ukupanIznos)
				}else{
					statistika.ukupanPdv = statistika.ukupanPdv + iznosNaloga*0.2;
					statistika.osnovica	= statistika.osnovica + parseFloat(naloziToSend[i].ukupanIznos)
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
						naloziToSend.push(nalogToPush)
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

			for(var i=0;i<naloziToSend.length;i++){
				if(isNaN(parseFloat(naloziToSend[i].ukupanIznos))){
					warnings.push("Nalog "+ naloziToSend.broj +" nema definisan iznos ("+naloziToSend[i].ukupanIznos+").")
				}
				var iznosNaloga = isNaN(parseFloat(naloziToSend[i].ukupanIznos)) ? 0 : parseFloat(naloziToSend[i].ukupanIznos);
				statistika.ukupanIznos = statistika.ukupanIznos + iznosNaloga
				if(iznosNaloga>=500000){
					statistika.ukupnoPrekoPolaMil++;
					statistika.neoporezivo	= statistika.neoporezivo	+ iznosNaloga;
				}else{
					statistika.ukupanPdv = statistika.ukupanPdv + iznosNaloga*0.2;
					statistika.osnovica	= statistika.osnovica	+ iznosNaloga;
				}
			}
			naloziToSend = naloziToSend.sort((a, b) => {
				if (a.faktura.samoBroj < b.faktura.samoBroj) {
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


