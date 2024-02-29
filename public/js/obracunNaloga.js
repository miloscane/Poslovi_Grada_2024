var obracunElem = document.getElementById("obracun-wrap");
function addRow(json){
	//json = {code:code,quantity:quantity}

	if(json){
		var rowJson = getPriceByCode(json.code);
		rowJson.kolicina = json.quantity;
	}
	var row = document.createElement("DIV");
	row.setAttribute("class","row");
		var redniBroj = document.createElement("DIV");
		redniBroj.setAttribute("class","elem redniBroj");
		redniBroj.innerHTML = eval(obracunElem.getElementsByClassName("row").length + 1) + ".";
		row.appendChild(redniBroj);

		var sifra = document.createElement("DIV");
		sifra.setAttribute("class","elem sifra");
		if(json){
			sifra.innerHTML = "<input type=\"text\" class=\"sifra\" oninput=\"showSuggestions(this)\" value=\""+rowJson.code+"\">";
		}else{
			sifra.innerHTML = "<input type=\"text\" class=\"sifra\" oninput=\"showSuggestions(this)\">";
		}
		row.appendChild(sifra);

		var naziv = document.createElement("DIV");
		naziv.setAttribute("class","elem naziv");
		if(json){
			naziv.innerHTML = "<textarea class=\"naziv\" oninput=\"showSuggestions(this)\">"+rowJson.name+"</textarea>";
		}else{
			naziv.innerHTML = "<textarea class=\"naziv\" oninput=\"showSuggestions(this)\"></textarea>";
		}
		row.appendChild(naziv);

		var jedinica = document.createElement("DIV");
		jedinica.setAttribute("class","elem jedinica");
		jedinica.innerHTML = json ? rowJson.unit : " ";
		row.appendChild(jedinica);

		var cena = document.createElement("DIV");
		cena.setAttribute("class","elem cena");
		cena.innerHTML = json ? brojSaRazmacima(rowJson.price) : " ";
		if(json){
			cena.setAttribute("data-price",rowJson.price)
		}
		row.appendChild(cena);

		var kolicina = document.createElement("DIV");
		kolicina.setAttribute("class","elem kolicina");
			var input = document.createElement("INPUT");
			input.setAttribute("type","number");
			input.setAttribute("class","kolicina");
			input.setAttribute("min","0");
			if(json){
				input.setAttribute("value",rowJson.kolicina);
			}
			input.setAttribute("oninput","quantityInput(this)");
			kolicina.appendChild(input);

			var plus = document.createElement("DIV");
			plus.setAttribute("class","plus");
			plus.setAttribute("onclick","setQuantity(this,1)");
			plus.innerHTML = "+";
			kolicina.appendChild(plus);

			var minus = document.createElement("DIV");
			minus.setAttribute("class","minus");
			minus.setAttribute("onclick","setQuantity(this,-1)");
			minus.innerHTML = "-";
			kolicina.appendChild(minus);
		row.appendChild(kolicina);

		var ukupno = document.createElement("DIV");
		ukupno.setAttribute("class","elem ukupno");
		ukupno.innerHTML = json ? brojSaRazmacima(parseFloat(rowJson.kolicina)*parseFloat(rowJson.price)) : " ";
		row.appendChild(ukupno);

		var obrisi = document.createElement("DIV");
		obrisi.setAttribute("class","elem obrisi");
		obrisi.setAttribute("onclick","deleteRow(this)");
		obrisi.innerHTML = "<img src=\"/images/deleteRow.png\">";
		row.appendChild(obrisi);
	obracunElem.appendChild(row);
}

function deleteRow(elem){
	elem.parentElement.remove();
	var leftOverRows = document.getElementById("obracun-wrap").getElementsByClassName("row");
	for(var i=0;i<leftOverRows.length;i++){
		leftOverRows[i].getElementsByClassName("redniBroj")[0].innerHTML = eval(i+1)+"."
	}
	calculateTable()
}

function setQuantity(elem,dir){
	if(Number(elem.parentElement.getElementsByTagName("INPUT")[0].value) + dir>=0){
		elem.parentElement.getElementsByTagName("INPUT")[0].value = Number(elem.parentElement.getElementsByTagName("INPUT")[0].value) + dir;
		quantityInput(elem.parentElement.getElementsByTagName("INPUT")[0]);
	}
}

function showSuggestions(elem){
	var currentBoxes = document.getElementsByClassName("suggestionBox");
	for(var i=0;i<currentBoxes.length;i++){
		currentBoxes[i].remove();
	}
	if(elem.value.length>=3){
		var suggestionsToShow = [];
		if(elem.classList.contains("sifra")){
			for(var i=0;i<cenovnik.length;i++){
				if(cenovnik[i].code.includes(elem.value)){
					suggestionsToShow.push(cenovnik[i]);	
				}
			}
		}else if(elem.classList.contains("naziv")){
			for(var i=0;i<cenovnik.length;i++){
				if(cenovnik[i].name.toLowerCase().includes(elem.value.toLowerCase())){
					suggestionsToShow.push(cenovnik[i]);
				}
			}
		}

		var suggestionBox = document.createElement("DIV");
		suggestionBox.setAttribute("class","suggestionBox");

			var rowWrap = document.createElement("DIV");
			rowWrap.setAttribute("class","rowWrap");
			for(var i=0;i<suggestionsToShow.length;i++){
				var row = document.createElement("DIV");
				row.setAttribute("class","row");
				row.setAttribute("onclick","inputSuggestion(this)");
					var redniBroj = document.createElement("DIV");
					redniBroj.setAttribute("class","elem redniBroj");
					redniBroj.innerHTML = " ";
					row.appendChild(redniBroj);

					var sifra = document.createElement("DIV");
					sifra.setAttribute("class","elem sifra");
					sifra.innerHTML =  "<input type=\"text\" value=\""+suggestionsToShow[i].code+"\" readonly>";
					row.appendChild(sifra);

					var naziv = document.createElement("DIV");
					naziv.setAttribute("class","elem naziv");
					naziv.innerHTML =  "<textarea readonly>"+suggestionsToShow[i].name+"</textarea>";
					row.appendChild(naziv);

					var jedinica = document.createElement("DIV");
					jedinica.setAttribute("class","elem jedinica");
					jedinica.innerHTML =  suggestionsToShow[i].unit;
					row.appendChild(jedinica);

					var cena = document.createElement("DIV");
					cena.setAttribute("class","elem cena");
					cena.innerHTML = brojSaRazmacima(suggestionsToShow[i].price);
					row.appendChild(cena);

					var kolicina = document.createElement("DIV");
					kolicina.setAttribute("class","elem kolicina");
					kolicina.innerHTML = " ";
					row.appendChild(kolicina);

					var ukupno = document.createElement("DIV");
					ukupno.setAttribute("class","elem ukupno");
					ukupno.innerHTML = " ";
					row.appendChild(ukupno);

					var obrisi = document.createElement("DIV");
					obrisi.setAttribute("class","elem obrisi");
					obrisi.innerHTML = " ";
					row.appendChild(obrisi);
				rowWrap.appendChild(row);
			}
		suggestionBox.appendChild(rowWrap);
		elem.parentElement.parentElement.appendChild(suggestionBox);
	}
}

function getPriceByCode(code){
	var priceItem = false;
	for(var i=0;i<cenovnik.length;i++){
		if(cenovnik[i].code==code){
			priceItem = cenovnik[i];
			break;
		}
	}
	return priceItem;
}

function inputSuggestion(elem){
	var code = elem.getElementsByClassName("sifra")[0].getElementsByTagName("INPUT")[0].value;
	var priceItem = getPriceByCode(code);
	if(priceItem){
		var parent = elem.parentElement.parentElement.parentElement;
		parent.getElementsByClassName("sifra")[0].getElementsByTagName("INPUT")[0].value = priceItem.code;
		parent.getElementsByClassName("naziv")[0].getElementsByTagName("TEXTAREA")[0].value = priceItem.name;
		parent.getElementsByClassName("jedinica")[0].innerHTML = priceItem.unit;
		parent.getElementsByClassName("cena")[0].innerHTML = brojSaRazmacima(priceItem.price);
		parent.getElementsByClassName("cena")[0].dataset.price = priceItem.price;
		parent.getElementsByClassName("kolicina")[0].getElementsByTagName("INPUT")[0].value = 1;
		parent.getElementsByClassName("ukupno")[0].innerHTML = brojSaRazmacima(priceItem.price);
	}else{
		console.log("No price with that code")
	}
	elem.parentElement.parentElement.remove();
	addRow();
	calculateTable();
}

function calculateTable(){
	var ukupanIznos = 0;
	var rows = document.getElementById("obracun-wrap").getElementsByClassName("row");
	for(var i=0;i<rows.length;i++){
		if(!isNaN(parseFloat(rows[i].getElementsByClassName("cena")[0].dataset.price))){
			ukupanIznos = ukupanIznos + parseFloat(rows[i].getElementsByClassName("cena")[0].dataset.price)*rows[i].getElementsByClassName("kolicina")[0].getElementsByTagName("INPUT")[0].value;
		}
	}
	document.getElementById("tabela-iznos").innerHTML = brojSaRazmacima(ukupanIznos)+" дин.";
	document.getElementById("tabela-iznos").dataset.price = ukupanIznos;
	document.getElementById("iznos-naloga").innerHTML = brojSaRazmacima(ukupanIznos)+" дин.";
}

function quantityInput(elem){
	elem.parentElement.parentElement.getElementsByClassName("ukupno")[0].innerHTML = brojSaRazmacima(elem.value*parseFloat(elem.parentElement.parentElement.getElementsByClassName("cena")[0].dataset.price));
	calculateTable();
}
