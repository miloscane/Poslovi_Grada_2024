const {parentPort}		=	require("worker_threads");
const axios 			=	require('axios');
const request 			=	require('request');
var premijusHeader = {
    'accept': 'text/plain',
    'ApiKey': process.env.premijuskey,
    'Content-Type': 'application/xml'
};


//Penal je obrnut (100-penal je pravi penal, znaci penal od 100 znaci da nema penala)
function generatePremijusSaPenalom(info){
	var dateNow			=	new Date();
	var yearString 		=	dateNow.getFullYear();
	var monthString		=	Number(eval(dateNow.getMonth()+1));
	monthString			=	monthString<10 ? "0"+monthString : monthString;
	var dayString		=	Number(dateNow.getDate());
	dayString			=	dayString<10 ? "0"+dayString : dayString;
	var datumIzdavanja	=	yearString+"-"+monthString+"-"+dayString;
 
	//rok placanja
	dateNow.setDate(dateNow.getDate() + 45);
	var yearString 		=	dateNow.getFullYear();
	var monthString		=	Number(eval(dateNow.getMonth()+1));
	monthString			=	monthString<10 ? "0"+monthString : monthString;
	var dayString		=	Number(dateNow.getDate());
	dayString			=	dayString<10 ? "0"+dayString : dayString;
	var rokPlacanja		=	yearString+"-"+monthString+"-"+dayString;
	var pdv 			=	info.pdv ? info.pdv : "35"; //35 je datum prometa a 3 je datum slanja
	var datumIspostavljanjaNarudzbenice = info.datumPrometa.split(".")[2]+"-"+info.datumPrometa.split(".")[1]+"-"+info.datumPrometa.split(".")[0];
	var penal 			=	100-parseFloat(info.penal);
	var xml 	=	'<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2" xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2" xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2" xmlns:cec="urn:oasis:names:specification:ubl:schema:xsd:CommonExtensionComponents-2" xmlns:sbt="http://mfin.gov.rs/srbdt/srbdtext" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">'+
	   '<cbc:CustomizationID>urn:cen.eu:en16931:2017#compliant#urn:mfin.gov.rs:srbdt:2021</cbc:CustomizationID>'+
	   '<cbc:ID>'+info.brojFakture+'</cbc:ID>'+
	   '<cbc:IssueDate>'+datumIzdavanja+'</cbc:IssueDate>'+
	   '<cbc:DueDate>'+rokPlacanja+'</cbc:DueDate>'+
	   '<cbc:InvoiceTypeCode>380</cbc:InvoiceTypeCode>'+
	   '<cbc:DocumentCurrencyCode>RSD</cbc:DocumentCurrencyCode>'+
	   '<cbc:BuyerReference>PORTAL</cbc:BuyerReference>'+
	   '<cac:InvoicePeriod>'+
	      '<cbc:DescriptionCode>'+pdv+'</cbc:DescriptionCode>'+
	   '</cac:InvoicePeriod>'+
	   '<cac:OrderReference>'+
			'<cbc:ID>'+info.brojNaloga+'</cbc:ID>'+
			'</cac:OrderReference>'+
	   '<cac:OriginatorDocumentReference>'+
	      '<cbc:ID>OP-00052/23-OS</cbc:ID>'+
	   '</cac:OriginatorDocumentReference>'+
	   '<cac:AccountingSupplierParty>'+
	      '<cac:Party>'+
	         '<cbc:EndpointID schemeID="9948">110164390</cbc:EndpointID>'+
	         '<cac:PartyName>'+
	            '<cbc:Name>PREMIJUS D.O.O. BEOGRAD-ZEMUN</cbc:Name>'+
	         '</cac:PartyName>'+
	         '<cac:PostalAddress>'+
	            '<cbc:StreetName>STANKA TIŠME 31 Ђ</cbc:StreetName>'+
	            '<cbc:CityName>Beograd (Zemun)</cbc:CityName>'+
	            '<cac:Country>'+
	               '<cbc:IdentificationCode>RS</cbc:IdentificationCode>'+
	            '</cac:Country>'+
	         '</cac:PostalAddress>'+
	         '<cac:PartyTaxScheme>'+
	            '<cbc:CompanyID>RS110164390</cbc:CompanyID>'+
	            '<cac:TaxScheme>'+
	               '<cbc:ID>VAT</cbc:ID>'+
	            '</cac:TaxScheme>'+
	         '</cac:PartyTaxScheme>'+
	         '<cac:PartyLegalEntity>'+
	            '<cbc:RegistrationName>PREMIJUS D.O.O. BEOGRAD-ZEMUN</cbc:RegistrationName>'+
	            '<cbc:CompanyID>21309192</cbc:CompanyID>'+
	         '</cac:PartyLegalEntity>'+
	         '<cac:Contact>'+
	            '<cbc:ElectronicMail>premijusdoo@gmail.com</cbc:ElectronicMail>'+
	         '</cac:Contact>'+
	      '</cac:Party>'+
	   '</cac:AccountingSupplierParty>'+
	   '<cac:AccountingCustomerParty>'+
	      '<cac:Party>'+
	         '<cbc:EndpointID schemeID="9948">100373090</cbc:EndpointID>'+
	         '<cac:PartyIdentification>'+
	            '<cbc:ID>JBKJS:81221</cbc:ID>'+
	         '</cac:PartyIdentification>'+
	         '<cac:PartyName>'+
	            '<cbc:Name>ЈАВНО ПРЕДУЗЕЋЕ "ГРАДСКО СТАМБЕНО"</cbc:Name>'+
	         '</cac:PartyName>'+
	         '<cac:PostalAddress>'+
	            '<cbc:StreetName>ДАНИЈЕЛОВА БР.33</cbc:StreetName>'+
	            '<cbc:CityName>БЕОГРАД</cbc:CityName>'+
	            '<cbc:PostalZone>11010</cbc:PostalZone>'+
	            '<cac:Country>'+
	               '<cbc:IdentificationCode>RS</cbc:IdentificationCode>'+
	            '</cac:Country>'+
	         '</cac:PostalAddress>'+
	         '<cac:PartyTaxScheme>'+
	            '<cbc:CompanyID>RS100373090</cbc:CompanyID>'+
	            '<cac:TaxScheme>'+
	               '<cbc:ID>VAT</cbc:ID>'+
	            '</cac:TaxScheme>'+
	         '</cac:PartyTaxScheme>'+
	         '<cac:PartyLegalEntity>'+
	            '<cbc:RegistrationName>ЈАВНО ПРЕДУЗЕЋЕ "ГРАДСКО СТАМБЕНО"</cbc:RegistrationName>'+
	            '<cbc:CompanyID>07486251</cbc:CompanyID>'+
	         '</cac:PartyLegalEntity>'+
	         '<cac:Contact>'+
	            '<cbc:ElectronicMail>jpgs@stambeno.com</cbc:ElectronicMail>'+
	         '</cac:Contact>'+
	      '</cac:Party>'+
	   '</cac:AccountingCustomerParty>'+
	   '<cac:Delivery>'+
	      '<cbc:ActualDeliveryDate>'+datumIspostavljanjaNarudzbenice+'</cbc:ActualDeliveryDate>'+
	   '</cac:Delivery>'+
	   '<cac:PaymentMeans>'+
	      '<cbc:PaymentMeansCode>30</cbc:PaymentMeansCode>'+
	      '<cbc:PaymentID>GS-7285/2023</cbc:PaymentID>'+
	      '<cac:PayeeFinancialAccount>'+
	         '<cbc:ID>325950070019703417</cbc:ID>'+
	      '</cac:PayeeFinancialAccount>'+
	   '</cac:PaymentMeans>'+
	   '<cac:TaxTotal>'+
	    '<cbc:TaxAmount currencyID="RSD">'+eval(parseFloat(info.iznos)*0.2).toFixed(2)+'</cbc:TaxAmount>'+
	    '<cac:TaxSubtotal>'+
	      '<cbc:TaxableAmount currencyID="RSD">'+parseFloat(info.iznos).toFixed(2)+'</cbc:TaxableAmount>'+
	      '<cbc:TaxAmount currencyID="RSD">'+eval(parseFloat(info.iznos)*0.2).toFixed(2)+'</cbc:TaxAmount>'+
	      '<cac:TaxCategory>'+
	        '<cbc:ID>S</cbc:ID>'+
	        '<cbc:Percent>20</cbc:Percent>'+
	        '<cac:TaxScheme>'+
	          '<cbc:ID>VAT</cbc:ID>'+
	        '</cac:TaxScheme>'+
	      '</cac:TaxCategory>'+
	    '</cac:TaxSubtotal>'+
	    '<cac:TaxSubtotal>'+
	      '<cbc:TaxableAmount currencyID="RSD">-'+eval(parseFloat(info.iznos)*penal/100).toFixed(2)+'</cbc:TaxableAmount>'+
	      '<cbc:TaxAmount currencyID="RSD">0.00</cbc:TaxAmount>'+
	      '<cac:TaxCategory>'+
	        '<cbc:ID>N</cbc:ID>'+
	        '<cbc:Percent>0</cbc:Percent>'+
	        '<cbc:TaxExemptionReasonCode>PDV-RS-3-DZ</cbc:TaxExemptionReasonCode>'+
	        '<cac:TaxScheme>'+
	          '<cbc:ID>VAT</cbc:ID>'+
	        '</cac:TaxScheme>'+
	      '</cac:TaxCategory>'+
	    '</cac:TaxSubtotal>'+
	  '</cac:TaxTotal>'+
	  '<cac:LegalMonetaryTotal>'+
	    '<cbc:LineExtensionAmount currencyID="RSD">'+eval(parseFloat(info.iznos)-parseFloat(info.iznos)*penal/100).toFixed(2)+'</cbc:LineExtensionAmount>'+
	    '<cbc:TaxExclusiveAmount currencyID="RSD">'+eval(parseFloat(info.iznos)-parseFloat(info.iznos)*penal/100).toFixed(2)+'</cbc:TaxExclusiveAmount>'+
	    '<cbc:TaxInclusiveAmount currencyID="RSD">'+eval(parseFloat(info.iznos)*1.2-parseFloat(info.iznos)*penal/100).toFixed(2)+'</cbc:TaxInclusiveAmount>'+
	    '<cbc:AllowanceTotalAmount currencyID="RSD">0</cbc:AllowanceTotalAmount>'+
	    '<cbc:PrepaidAmount currencyID="RSD">0</cbc:PrepaidAmount>'+
	    '<cbc:PayableRoundingAmount currencyID="RSD">0</cbc:PayableRoundingAmount>'+
	    '<cbc:PayableAmount currencyID="RSD">'+eval(parseFloat(info.iznos)*1.2-parseFloat(info.iznos)*penal/100).toFixed(2)+'</cbc:PayableAmount>'+
	  '</cac:LegalMonetaryTotal>'+
	  '<cac:InvoiceLine>'+
	    '<cbc:ID>1</cbc:ID>'+
	    '<cbc:InvoicedQuantity unitCode="H87">1</cbc:InvoicedQuantity>'+
	    '<cbc:LineExtensionAmount currencyID="RSD">'+parseFloat(info.iznos).toFixed(2)+'</cbc:LineExtensionAmount>'+
	    '<cac:Item>'+
	      '<cbc:Name>'+'HITNI I NEODLOŽNI RADOVI I TEKUĆE POPRAVKE-VIK RADOVI-'+info.adresa+' NARUDŽBENICA BR.'+info.brojNaloga+'</cbc:Name>'+
	      '<cac:ClassifiedTaxCategory>'+
	        '<cbc:ID>S</cbc:ID>'+
	        '<cbc:Percent>20</cbc:Percent>'+
	        '<cac:TaxScheme>'+
	          '<cbc:ID>VAT</cbc:ID>'+
	        '</cac:TaxScheme>'+
	      '</cac:ClassifiedTaxCategory>'+
	    '</cac:Item>'+
	    '<cac:Price>'+
	      '<cbc:PriceAmount currencyID="RSD">'+parseFloat(info.iznos).toFixed(2)+'</cbc:PriceAmount>'+
	    '</cac:Price>'+
	  '</cac:InvoiceLine>'+
	  '<cac:InvoiceLine>'+
	    '<cbc:ID>2</cbc:ID>'+
	    '<cbc:InvoicedQuantity unitCode="H87">-1</cbc:InvoicedQuantity>'+
	    '<cbc:LineExtensionAmount currencyID="RSD">-'+eval(parseFloat(info.iznos)*penal/100).toFixed(2)+'</cbc:LineExtensionAmount>'+
	    '<cac:Item>'+
	      '<cbc:Name>'+'HITNI I NEODLOŽNI RADOVI I TEKUĆE POPRAVKE-VIK RADOVI-'+info.adresa+' NARUDŽBENICA BR. '+info.broj+'</cbc:Name>'+
	      '<cac:ClassifiedTaxCategory>'+
	        '<cbc:ID>N</cbc:ID>'+
	        '<cbc:Percent>0</cbc:Percent>'+
	        '<cac:TaxScheme>'+
	          '<cbc:ID>VAT</cbc:ID>'+
	        '</cac:TaxScheme>'+
	      '</cac:ClassifiedTaxCategory>'+
	    '</cac:Item>'+
	    '<cac:Price>'+
	      '<cbc:PriceAmount currencyID="RSD">'+eval(parseFloat(info.iznos)*penal/100).toFixed(2)+'</cbc:PriceAmount>'+
	    '</cac:Price>'+
	  '</cac:InvoiceLine>'+
	'</Invoice>';
	return xml;
}

function generatePremijusBezPenala(info){
	var dateNow			=	new Date();
	var yearString 		=	dateNow.getFullYear();
	var monthString		=	Number(eval(dateNow.getMonth()+1));
	monthString			=	monthString<10 ? "0"+monthString : monthString;
	var dayString		=	Number(dateNow.getDate());
	dayString			=	dayString<10 ? "0"+dayString : dayString;
	var datumIzdavanja	=	yearString+"-"+monthString+"-"+dayString;
 
	//rok placanja
	dateNow.setDate(dateNow.getDate() + 45);
	var yearString 		=	dateNow.getFullYear();
	var monthString		=	Number(eval(dateNow.getMonth()+1));
	monthString			=	monthString<10 ? "0"+monthString : monthString;
	var dayString		=	Number(dateNow.getDate());
	dayString			=	dayString<10 ? "0"+dayString : dayString;
	var rokPlacanja		=	yearString+"-"+monthString+"-"+dayString;
	var pdv 			=	info.pdv ? info.pdv : "35"; //35 je datum prometa a 3 je datum slanja
	var datumIspostavljanjaNarudzbenice = info.datumPrometa.split(".")[2]+"-"+info.datumPrometa.split(".")[1]+"-"+info.datumPrometa.split(".")[0];
	var penal 			=	100-parseFloat(info.penal);
	var xml	=	'<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2" xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2" xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2" xmlns:cec="urn:oasis:names:specification:ubl:schema:xsd:CommonExtensionComponents-2" xmlns:sbt="http://mfin.gov.rs/srbdt/srbdtext" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">'+
	   '<cbc:CustomizationID>urn:cen.eu:en16931:2017#compliant#urn:mfin.gov.rs:srbdt:2021</cbc:CustomizationID>'+
	   '<cbc:ID>'+info.brojFakture+'</cbc:ID>'+
	   '<cbc:IssueDate>'+datumIzdavanja+'</cbc:IssueDate>'+
	   '<cbc:DueDate>'+rokPlacanja+'</cbc:DueDate>'+
	   '<cbc:InvoiceTypeCode>380</cbc:InvoiceTypeCode>'+
	   '<cbc:DocumentCurrencyCode>RSD</cbc:DocumentCurrencyCode>'+
	   '<cbc:BuyerReference>PORTAL</cbc:BuyerReference>'+
	   '<cac:InvoicePeriod>'+
	      '<cbc:DescriptionCode>'+pdv+'</cbc:DescriptionCode>'+
	   '</cac:InvoicePeriod>'+
	   '<cac:OrderReference>'+
			'<cbc:ID>'+info.brojNaloga+'</cbc:ID>'+
			'</cac:OrderReference>'+
	   '<cac:OriginatorDocumentReference>'+
	      '<cbc:ID>OP-00052/23-OS</cbc:ID>'+
	   '</cac:OriginatorDocumentReference>'+
	   '<cac:AccountingSupplierParty>'+
	      '<cac:Party>'+
	         '<cbc:EndpointID schemeID="9948">110164390</cbc:EndpointID>'+
	         '<cac:PartyName>'+
	            '<cbc:Name>PREMIJUS D.O.O. BEOGRAD-ZEMUN</cbc:Name>'+
	         '</cac:PartyName>'+
	         '<cac:PostalAddress>'+
	            '<cbc:StreetName>STANKA TIŠME 31 Ђ</cbc:StreetName>'+
	            '<cbc:CityName>Beograd (Zemun)</cbc:CityName>'+
	            '<cac:Country>'+
	               '<cbc:IdentificationCode>RS</cbc:IdentificationCode>'+
	            '</cac:Country>'+
	         '</cac:PostalAddress>'+
	         '<cac:PartyTaxScheme>'+
	            '<cbc:CompanyID>RS110164390</cbc:CompanyID>'+
	            '<cac:TaxScheme>'+
	               '<cbc:ID>VAT</cbc:ID>'+
	            '</cac:TaxScheme>'+
	         '</cac:PartyTaxScheme>'+
	         '<cac:PartyLegalEntity>'+
	            '<cbc:RegistrationName>PREMIJUS D.O.O. BEOGRAD-ZEMUN</cbc:RegistrationName>'+
	            '<cbc:CompanyID>21309192</cbc:CompanyID>'+
	         '</cac:PartyLegalEntity>'+
	         '<cac:Contact>'+
	            '<cbc:ElectronicMail>premijusdoo@gmail.com</cbc:ElectronicMail>'+
	         '</cac:Contact>'+
	      '</cac:Party>'+
	   '</cac:AccountingSupplierParty>'+
	   '<cac:AccountingCustomerParty>'+
	      '<cac:Party>'+
	         '<cbc:EndpointID schemeID="9948">100373090</cbc:EndpointID>'+
	         '<cac:PartyIdentification>'+
	            '<cbc:ID>JBKJS:81221</cbc:ID>'+
	         '</cac:PartyIdentification>'+
	         '<cac:PartyName>'+
	            '<cbc:Name>ЈАВНО ПРЕДУЗЕЋЕ "ГРАДСКО СТАМБЕНО"</cbc:Name>'+
	         '</cac:PartyName>'+
	         '<cac:PostalAddress>'+
	            '<cbc:StreetName>ДАНИЈЕЛОВА БР.33</cbc:StreetName>'+
	            '<cbc:CityName>БЕОГРАД</cbc:CityName>'+
	            '<cbc:PostalZone>11010</cbc:PostalZone>'+
	            '<cac:Country>'+
	               '<cbc:IdentificationCode>RS</cbc:IdentificationCode>'+
	            '</cac:Country>'+
	         '</cac:PostalAddress>'+
	         '<cac:PartyTaxScheme>'+
	            '<cbc:CompanyID>RS100373090</cbc:CompanyID>'+
	            '<cac:TaxScheme>'+
	               '<cbc:ID>VAT</cbc:ID>'+
	            '</cac:TaxScheme>'+
	         '</cac:PartyTaxScheme>'+
	         '<cac:PartyLegalEntity>'+
	            '<cbc:RegistrationName>ЈАВНО ПРЕДУЗЕЋЕ "ГРАДСКО СТАМБЕНО"</cbc:RegistrationName>'+
	            '<cbc:CompanyID>07486251</cbc:CompanyID>'+
	         '</cac:PartyLegalEntity>'+
	         '<cac:Contact>'+
	            '<cbc:ElectronicMail>jpgs@stambeno.com</cbc:ElectronicMail>'+
	         '</cac:Contact>'+
	      '</cac:Party>'+
	   '</cac:AccountingCustomerParty>'+
	   '<cac:Delivery>'+
	      '<cbc:ActualDeliveryDate>'+datumIspostavljanjaNarudzbenice+'</cbc:ActualDeliveryDate>'+
	   '</cac:Delivery>'+
	   '<cac:PaymentMeans>'+
	      '<cbc:PaymentMeansCode>30</cbc:PaymentMeansCode>'+
	      '<cbc:PaymentID>'+info.brojFakture+'</cbc:PaymentID>'+
	      '<cac:PayeeFinancialAccount>'+
	         '<cbc:ID>325950070019703417</cbc:ID>'+
	      '</cac:PayeeFinancialAccount>'+
	   '</cac:PaymentMeans>'+
	   '<cac:TaxTotal>'+
	      '<cbc:TaxAmount currencyID="RSD">'+eval(parseFloat(info.iznos)*0.2).toFixed(2)+'</cbc:TaxAmount>'+
	      '<cac:TaxSubtotal>'+
	         '<cbc:TaxableAmount currencyID="RSD">'+parseFloat(info.iznos).toFixed(2)+'</cbc:TaxableAmount>'+
	         '<cbc:TaxAmount currencyID="RSD">'+eval(parseFloat(info.iznos)*0.2).toFixed(2)+'</cbc:TaxAmount>'+
	         '<cac:TaxCategory>'+
	            '<cbc:ID>S</cbc:ID>'+
	            '<cbc:Percent>20</cbc:Percent>'+
	            '<cac:TaxScheme>'+
	               '<cbc:ID>VAT</cbc:ID>'+
	            '</cac:TaxScheme>'+
	         '</cac:TaxCategory>'+
	      '</cac:TaxSubtotal>'+
	   '</cac:TaxTotal>'+
	   '<cac:LegalMonetaryTotal>'+
	      '<cbc:LineExtensionAmount currencyID="RSD">'+parseFloat(info.iznos).toFixed(2)+'</cbc:LineExtensionAmount>'+
	      '<cbc:TaxExclusiveAmount currencyID="RSD">'+parseFloat(info.iznos).toFixed(2)+'</cbc:TaxExclusiveAmount>'+
	      '<cbc:TaxInclusiveAmount currencyID="RSD">'+eval(parseFloat(info.iznos)*1.2).toFixed(2)+'</cbc:TaxInclusiveAmount>'+
	      '<cbc:AllowanceTotalAmount currencyID="RSD">0</cbc:AllowanceTotalAmount>'+
	      '<cbc:PrepaidAmount currencyID="RSD">0</cbc:PrepaidAmount>'+
	      '<cbc:PayableAmount currencyID="RSD">'+eval(parseFloat(info.iznos)*1.2).toFixed(2)+'</cbc:PayableAmount>'+
	   '</cac:LegalMonetaryTotal>'+
	   '<cac:InvoiceLine>'+
	      '<cbc:ID>1</cbc:ID>'+
	      '<cbc:InvoicedQuantity unitCode="H87">1</cbc:InvoicedQuantity>'+
	      '<cbc:LineExtensionAmount currencyID="RSD">'+parseFloat(info.iznos).toFixed(2)+'</cbc:LineExtensionAmount>'+
	      '<cac:Item>'+
	         '<cbc:Name>HITNI I NEODLOŽNI RADOVI I TEKUĆE POPRAVKE-VIK RADOVI-'+info.adresa+'-NARUDŽBENICA BR.'+info.broj+'</cbc:Name>'+
	         '<cac:ClassifiedTaxCategory>'+
	            '<cbc:ID>S</cbc:ID>'+
	            '<cbc:Percent>20</cbc:Percent>'+
	            '<cac:TaxScheme>'+
	               '<cbc:ID>VAT</cbc:ID>'+
	            '</cac:TaxScheme>'+
	         '</cac:ClassifiedTaxCategory>'+
	      '</cac:Item>'+
	      '<cac:Price>'+
	         '<cbc:PriceAmount currencyID="RSD">'+parseFloat(info.iznos).toFixed(2)+'</cbc:PriceAmount>'+
	      '</cac:Price>'+
	   '</cac:InvoiceLine>'+
	'</Invoice>';
	return xml;
}



parentPort.on("message", receiveObject => {
	var infoJson	=	JSON.parse(receiveObject);
	var bodyString	=	"";
	if(Number(infoJson.penal)<100){
		bodyString	=	generatePremijusSaPenalom(infoJson)
	}else{
		bodyString	=	generatePremijusBezPenala(infoJson)
	}

	/*axios({
	    method: 'POST',
	    url: 'https://efaktura.mfin.gov.rs/api/publicApi/sales-invoice/ubl?requestId='+new Date().getTime()+'&sendToCir=No',
	    headers: premijusHeader,
	    body: bodyString
	})
	.then((response,body)=>{
		console.log("From worker:")
		console.log(response)
		parentPort.postMessage(response);
	})
	.catch((error)=>{
		console.log(error);
	})*/

	var options = {
	    url: 'https://efaktura.mfin.gov.rs/api/publicApi/sales-invoice/ubl?requestId='+new Date().getTime()+'&sendToCir=No',
	    method: 'POST',
	    headers: premijusHeader,
	    body: bodyString
	};

	var toParent = {};
	request(options, (error,response,body)=>{
		if(error){
			console.log(error)
			toParent.error = 1;
			toParent.message = "Проблем са СЕФ-ом.";
			toParent.messageString = error.toString();
			parentPort.postMessage(JSON.stringify(toParent));
		}else{
			var responseBody	=	{};
			try{
				responseBody	=	JSON.parse(response.body);
				var messagePremijus;
				if(responseBody.InvoiceId){
					toParent.error = 0;
					toParent.message = "Фактура успешно окачена.";
					toParent.faktura = responseBody;
					toParent.messageString = JSON.stringify(response.body);
					parentPort.postMessage(JSON.stringify(toParent));
				}else{
					toParent.error = 2;
					toParent.message = "СЕФ није дозволио качење.";
					toParent.messageString = JSON.stringify(response.body);
					parentPort.postMessage(JSON.stringify(toParent));
				}
			}catch(err){
				console.log(err)
				toParent.error = 3;
				toParent.message = "Проблем у одговору СЕФ-а.";
				toParent.messageString = err.toString();
				parentPort.postMessage(JSON.stringify(toParent));
			}	
		}
	})
});