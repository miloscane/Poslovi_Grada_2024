var podizvodjaci  = ["mile--1672650353244","SeHQZ--1672650353244","IIwY4--1672650358507","e3MHS--1675759749849","eupy8--1676039178890","S5mdP--1677669290493","0ztkS--1672041761145","ylSnq--1672041756318"];
var radneJedinice = ["NOVI BEOGRAD","ZEMUN","ČUKARICA","SAVSKI VENAC","VRAČAR","RAKOVICA","ZVEZDARA","VOŽDOVAC","STARI GRAD","PALILULA"];
//var meseciJson    = [{name:"Februar 2024",string:"02.2024"},{name:"Mart 2024",string:"03.2024"},{name:"April 2024",string:"04.2024"},{name:"Maj 2024",string:"05.2024"},{name:"Jun 2024",string:"06.2024"},{name:"Jul 2024",string:"07.2024"},{name:"Avgust 2024",string:"08.2024"},{name:"Septembar 2024",string:"09.2024"},{name:"Oktobar 2024",string:"10.2024"},{name:"Novembar 2024",string:"11.2024"},{name:"Decembar 2024",string:"12.2024"},{name:"Januar 2025",string:"01.2025"},{name:"Februar 2025",string:"02.2025"},{name:"Mart 2025",string:"03.2025"},{name:"April 2025",string:"04.2025"},{name:"Maj 2025",string:"05.2025"},{name:"Jun 2025",string:"06.2025"},{name:"Jul 2025",string:"07.2025"},{name:"Avgust 2025",string:"08.2025"},{name:"Septembar 2025",string:"09.2025"}]
var meseciJson    = [{name:"Avgust 2025",string:"08.2025"},{name:"Septembar 2025",string:"09.2025"},{name:"Oktobar 2025",string:"10.2025"},{name:"Novembar 2025",string:"11.2025"},{name:"Decembar 2025",string:"12.2025"},{name:"Januar 2026",string:"01.2026"},{name:"Februar 2026",string:"02.2025"}]
var daniUNedelji  = ["ПОНЕДЕЉАК","УТОРАК","СРЕДА","ЧЕТВРТАК","ПЕТАК","СУБОТА","НЕДЕЉА"];
var istok         = ["ZVEZDARA","RAKOVICA","VOŽDOVAC","STARI GRAD","PALILULA"];
var zapad         = ["NOVI BEOGRAD","ZEMUN","ČUKARICA","VRAČAR","SAVSKI VENAC"];

function checkEmail(email){
	return String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
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

function brojSaRazmacimaBezDecimala(x) {
  if(!x){
    return 0
  }
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

function getDateAsStringForInputObject(date){
  var yearString  = date.getFullYear();
  var month   = eval(date.getMonth()+1);
  var monthString = (month<10) ? "0" + month : month;
  var day     = date.getDate();
  var dayString = (day<10) ? "0" + day : day;
  return  yearString+"-"+monthString+"-"+dayString;
}

function reshuffleDate(date){//gets yyyy-mm-dd and returns dd.mm.yyyy
  var array = date.split("-");
  return  array[2]+"."+array[1]+"."+array[0];
}

function reshuffleDateInverse(date){//gets dd.mm.yyyy. and returns yyyy-mm-dd
  var array = date.split(".");
  return  array[2]+"-"+array[1]+"-"+array[0];
}

function reshuffleDateInverse2(date){//gets dd-mm-yyyy and returns yyyy-mm-dd
  var array = date.split("-");
  return  array[2]+"-"+array[1]+"-"+array[0];
}

function getDateAsStringForDisplay(date){
  var yearString  = date.getFullYear();
  var month   = eval(date.getMonth()+1);
  var monthString = (month<10) ? "0" + month : month;
  var day     = date.getDate();
  var dayString = (day<10) ? "0" + day : day;
  return  dayString+"."+monthString+"."+yearString;
}

function datetimeToReadable(datetime){
  var date = new Date(Number(datetime));
  var yearString  = date.getFullYear();
  var month   = eval(date.getMonth()+1);
  var monthString = (month<10) ? "0" + month : month;
  var day     = date.getDate();
  var dayString = (day<10) ? "0" + day : day;
  return  dayString+"."+monthString+"."+yearString + ". - "+date.getHours().toString().padStart(2,"0")+":"+date.getMinutes().toString().padStart(2,"0");
}

function datetimeToReadable2(datetime){
  var date = new Date(Number(datetime));
  var yearString  = date.getFullYear();
  var month   = eval(date.getMonth()+1);
  var monthString = (month<10) ? "0" + month : month;
  var day     = date.getDate();
  var dayString = (day<10) ? "0" + day : day;
  return  dayString+"."+monthString+"."+yearString + ".<br><i>"+date.getHours().toString().padStart(2,"0")+":"+date.getMinutes().toString().padStart(2,"0")+"</i>";
}

function getTimestamp(date){
  var currentDate = new Date(date);
  var currentHour = currentDate.getHours().toString().length==1 ? "0"+currentDate.getHours() : currentDate.getHours();
  var currentMinute = currentDate.getMinutes().toString().length==1 ? "0"+currentDate.getMinutes() : currentDate.getMinutes();
  return  currentHour +":"+currentMinute;
}

function getMajstorByCode(majstorId){
  var majstor = {};
  if(majstori){
    for(var i=0;i<majstori.length;i++){
      if(majstori[i].uniqueId==majstorId){
        majstor = majstori[i]
      }
    }
    if(!majstor.ime){
      console.log("No majstor found")
    }
  }else{
    console.log("No array majstori defined");
  }
  return majstor
}


function getProizvodByCode(uniqueId){
  var proizvod = {};
  if(proizvodi){
    for(var i=0;i<proizvodi.length;i++){
      if(proizvodi[i].uniqueId==uniqueId){
        proizvod = proizvodi[i]
      }
    }
    if(!proizvod.name){
      console.log("No proizvod found")
    }
  }else{
    console.log("No array proizvodi defined");
  }
  return proizvod
}

function getPriceItemByCode(code){
  var json = {};
  if(cenovnik){
    for(var i=0;i<cenovnik.length;i++){
      if(cenovnik[i].code==code){
        json = cenovnik[i];
        break;
      }
    }
  }else{
    console.log("No cenovnik defined");
  }
  return json
}

function vremePrijema(datetime){
  var date    = new Date(Number(datetime));
  var yearString  = date.getFullYear();
  var month   = eval(date.getMonth()+1);
  var monthString = (month<10) ? "0" + month : month;
  var day     = date.getDate();
  var dayString = (day<10) ? "0" + day : day;
  var hour    = date.getHours();
  var hourString  = (hour<10) ? "0" + hour : hour;
  var minute    = date.getMinutes();
  var minuteString= (minute<10) ? "0" + minute : minute;
  return  dayString+"."+monthString+"."+yearString+". "+hourString+":"+minuteString;
}

function haversine_distance(mk1, mk2) {
  var R = 6371;//radius of eart in km //3958.8; // Radius of the Earth in miles
  var rlat1 = mk1.lat * (Math.PI/180); // Convert degrees to radians
  var rlat2 = mk2.lat * (Math.PI/180); // Convert degrees to radians
  var difflat = rlat2-rlat1; // Radian difference (latitudes)
  var difflon = (mk2.lng-mk1.lng) * (Math.PI/180); // Radian difference (longitudes)

  var d = 2 * R * Math.asin(Math.sqrt(Math.sin(difflat/2)*Math.sin(difflat/2)+Math.cos(rlat1)*Math.cos(rlat2)*Math.sin(difflon/2)*Math.sin(difflon/2)));
  return d;
}

function izvuciBroj(str){
  var broj = "";
  for(var i=0;i<str.length;i++){
    if(!isNaN(Number(str[i]))){
      broj += str[i];
    }
  }
  return broj;
}

function istiDatum(d1, d2) {
  return d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();
}

function countWorkdays(year, month, holidays = []) {//let holidays = ['2025-02-17'];
    let workdays = 0;
    let totalDays = new Date(year, month, 0).getDate(); // Get total days in the month

    for (let day = 1; day <= totalDays; day++) {
        let date = new Date(year, month - 1, day);
        let dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday

        if (dayOfWeek !== 0 && dayOfWeek !== 6 && !holidays.includes(date.toISOString().split('T')[0])) {
            workdays++;
        }
    }
    
    return workdays;
}

function detectSwipe(el, callback) {
    let startX, startY, startTime;

    el.addEventListener("touchstart", (e) => {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        startTime = new Date().getTime();
    });

    el.addEventListener("touchmove", (e) => {
        //e.preventDefault(); // Prevent default scroll if needed
    }, { passive: false });

    el.addEventListener("touchend", (e) => {
        let endX = e.changedTouches[0].clientX;
        let endY = e.changedTouches[0].clientY;
        let deltaX = endX - startX;
        let deltaY = endY - startY;
        let elapsedTime = new Date().getTime() - startTime;

        // Minimum swipe distance and angle check
        if (Math.abs(deltaX) > 100 && Math.abs(deltaX) > Math.abs(deltaY)) {
            if (elapsedTime < 500) { // Ensures fast swipes are considered
                if (deltaX < 0) {
                    callback("left");
                } else {
                    callback("right");
                }
            }
        }
    });
}

function getTimeDifference(date1, date2) {
    let d1 = new Date(date1);
    let d2 = new Date(date2);

    let diff = Math.abs(d2 - d1); // Difference in milliseconds

    let hours = Math.floor(diff / (1000 * 60 * 60));
    let minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    let seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function msToHHMM(ms) {
    let totalMinutes = Math.floor(ms / 60000); // 1 minute = 60000 ms
    let hours = Math.floor(totalMinutes / 60);
    let minutes = totalMinutes % 60;
    
    // Pad with leading zeros if needed
    hours = String(hours).padStart(2, '0');
    minutes = String(minutes).padStart(2, '0');
    
    return `${hours}:${minutes}`;
}

function sToHHMM(ms) {
    let totalMinutes = Math.floor(ms / 60); // 1 minute = 60000 ms
    let hours = Math.floor(totalMinutes / 60);
    let minutes = totalMinutes % 60;
    
    // Pad with leading zeros if needed
    hours = String(hours).padStart(2, '0');
    minutes = String(minutes).padStart(2, '0');
    
    return `${hours}:${minutes}`;
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

function parseLocalizedNumber(input) {
  if (typeof input === "number") return input; // Already a number

  if (typeof input !== "string") return NaN; // Not a string or number

  // Remove all whitespace (space as thousand separator)
  input = input.replace(/\s/g, '');

  const lastComma = input.lastIndexOf(',');
  const lastDot = input.lastIndexOf('.');

  let decimalSeparator;
  if (lastComma > lastDot) {
    decimalSeparator = ',';
  } else {
    decimalSeparator = '.';
  }

  // Replace all separators except the last decimal with ''
  const cleaned = input.replace(/[.,]/g, (match, offset) => {
    return offset === (decimalSeparator === ',' ? lastComma : lastDot) ? '.' : '';
  });

  return parseFloat(cleaned);
}

function generateTimes(startHour, endHour, interval) {
  const times = [];
  for (let h = startHour; h <= endHour; h++) {
    for (let m = 0; m < 60; m += interval) {
      if (h === endHour && m > 0) break; // stop at 22:00 exactly
      const hour = String(h).padStart(2, "0");
      const minute = String(m).padStart(2, "0");
      times.push(`${hour}:${minute}`);
    }
  }
  return times;
}

function isIntersecting(el1, el2) {
  const r1 = el1.getBoundingClientRect();
  const r2 = el2.getBoundingClientRect();

  return !(
    r1.top > r2.bottom ||
    r1.right < r2.left ||
    r1.bottom < r2.top ||
    r1.left > r2.right
  );
}

function getMonday(date = new Date()) {
  const d = new Date(date);
  const day = d.getDay(); // Sunday = 0, Monday = 1, ..., Saturday = 6
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is Sunday
  return new Date(d.setDate(diff));
}

function getWeekDay(date) {
  let day = date.getDay();
  return (day + 6) % 7; 
}

function isYesterdayAfter3PM(date1, date2) {
  const d1 = new Date(date1);
  const d2 = new Date(date2);

  // Get date2 normalized to midnight
  const ref = new Date(d2);
  ref.setHours(0, 0, 0, 0);

  // Get "yesterday" relative to date2
  const yesterday = new Date(ref);
  yesterday.setDate(ref.getDate() - 1);

  // Check if date1 is that "yesterday"
  const isYesterday =
    d1.getFullYear() === yesterday.getFullYear() &&
    d1.getMonth() === yesterday.getMonth() &&
    d1.getDate() === yesterday.getDate();

  // Must also be after 15:00
  return isYesterday && d1.getHours() >= 15;
}

var definicijeProizvoda = [
                    {
                      "startCode":"01.01",
                      "name":"Pocinkovane Cevi"
                    },
                    {
                      "startCode":"01.02",
                      "name":"Pocinkovani Holenderi"
                    },
                    {
                      "startCode":"01.03",
                      "name":"Pocinkovani Dupli Nipl"
                    },
                    {
                      "startCode":"01.04",
                      "name":"Pocinkovana Kolena"
                    },
                    {
                      "startCode":"01.05",
                      "name":"Pocinkovani Muf"
                    },
                    {
                      "startCode":"01.06",
                      "name":"Pocinkovani T-Komadi"
                    },
                    {
                      "startCode":"01.07",
                      "name":"Pocinkovani T-Komadi-Krst"
                    },
                    {
                      "startCode":"01.08",
                      "name":"Čepovi"
                    },
                    {
                      "startCode":"01.09",
                      "name":"Pocinkovane redukcije"
                    },
                    {
                      "startCode":"01.10",
                      "name":"Kuplung Spojnice"
                    },
                    {
                      "startCode":"01.11",
                      "name":"Klizne Spojnice"
                    },
                    {
                      "startCode":"01.12",
                      "name":"Kugla ventili"
                    },
                    {
                      "startCode":"01.13",
                      "name":"Mesingani Ventili"
                    },
                    {
                      "startCode":"01.14",
                      "name":"Virble za propusne ventile"
                    },
                    {
                      "startCode":"01.15",
                      "name":"Propsni ventil telo"
                    },
                    {
                      "startCode":"01.16",
                      "name":"PPR Cevi"
                    },
                    {
                      "startCode":"01.17",
                      "name":"PPR Mufovi"
                    },
                    {
                      "startCode":"01.18",
                      "name":"PPR Mufovi SN"
                    },
                    {
                      "startCode":"01.19",
                      "name":"PPR Mufovi UN"
                    },
                    {
                      "startCode":"01.20",
                      "name":"PPR Kolena SN"
                    },
                    {
                      "startCode":"01.21",
                      "name":"PPR Kolena UN"
                    },
                    {
                      "startCode":"01.22",
                      "name":"PPR Kolena 90"
                    },
                    {
                      "startCode":"01.23",
                      "name":"PPR Kolena 45"
                    },
                    {
                      "startCode":"01.24",
                      "name":"PPR Holenderi"
                    },
                    {
                      "startCode":"01.25",
                      "name":"PPR T-komadi"
                    },
                    {
                      "startCode":"01.26",
                      "name":"PPR Zaobilazni lukovi"
                    },
                    {
                      "startCode":"01.27",
                      "name":"PPR Čepovi"
                    },
                    {
                      "startCode":"01.28",
                      "name":"Ispitni čepovi"
                    },
                    {
                      "startCode":"01.29",
                      "name":"PPR Ventil kape"
                    },
                    {
                      "startCode":"01.30",
                      "name":"PPR Ventil Točkovi"
                    },
                    {
                      "startCode":"01.31",
                      "name":"PPR Ventil Kugle"
                    },
                    {
                      "startCode":"01.32",
                      "name":"PPR Redukcije"
                    },
                    {
                      "startCode":"01.33",
                      "name":"PPR Obujmice"
                    },
                    {
                      "startCode":"01.34",
                      "name":"PPR redukovani T-Komadi"
                    },
                    {
                      "startCode":"01.35",
                      "name":"PP poluspojke"
                    },
                    {
                      "startCode":"01.36",
                      "name":"PP spojke"
                    },
                    {
                      "startCode":"01.37",
                      "name":"Okiteni"
                    },
                    {
                      "startCode":"01.38",
                      "name":"Hidrantske"
                    },
                    {
                      "startCode":"01.39",
                      "name":"PP"
                    },
                    {
                      "startCode":"02.01",
                      "name":"PVC Cevi"
                    },
                    {
                      "startCode":"02.02",
                      "name":"PVC Revizije"
                    },
                    {
                      "startCode":"02.03",
                      "name":"LG Prelazi"
                    },
                    {
                      "startCode":"02.04",
                      "name":"HL Prelazi"
                    },
                    {
                      "startCode":"02.05",
                      "name":"Kermaički prelazi"
                    },
                    {
                      "startCode":"02.06",
                      "name":"Prelazne gume"
                    },
                    {
                      "startCode":"02.07",
                      "name":"PVC Lukovi 45"
                    },
                    {
                      "startCode":"02.08",
                      "name":"PVC Lukovi 90"
                    },
                    {
                      "startCode":"02.09",
                      "name":"PVC Redukcije"
                    },
                    {
                      "startCode":"02.10",
                      "name":"PVC Račve-T"
                    },
                    {
                      "startCode":"02.11",
                      "name":"PVC Kose Račve-T"
                    },
                    {
                      "startCode":"02.12",
                      "name":"PVC Dupla Kosa Račva"
                    },
                    {
                      "startCode":"02.13",
                      "name":"PVC Klizna Spojka"
                    },
                    {
                      "startCode":"02.14",
                      "name":"PVC Slivnici"
                    },
                    {
                      "startCode":"02.15",
                      "name":"Šaht poklopci"
                    },
                    {
                      "startCode":"02.16",
                      "name":"Gajger Slivnici"
                    },
                    {
                      "startCode":"03.01",
                      "name":"Potrošni Materijali"
                    },
                    {
                      "startCode":"03.02",
                      "name":"Rezne Ploče"
                    },
                    {
                      "startCode":"04.01",
                      "name":"Građevinski materijal 1"
                    },
                    {
                      "startCode":"04.02",
                      "name":"Građevinski materijal 2"
                    },
                    {
                      "startCode":"04.03",
                      "name":"Građevinski materijal 3"
                    }
                  ]
