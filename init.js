// Überprüfen, ob Besucher ein Bot ist;
agent_check_bot=/bot|googlebot|crawler|spider|robot|crawling|favicon/i;
// Überprüfen, ob Besucher mobil ist;
agent_check_mobil=/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i;

const fs=require("fs");
const os=require("os");
const xxhash=require("xxhash");
const useragent=require("useragent");

const myShortName="LFF5644";
const myName="Lando Fernandez-Falk";
const myFistName="Lando";

const darkEnabledHours=[19,6];

// OLD CHIT'Y TEMPLATES!
const unESC=unescape;
const ESC=escape;

if(typeof(log)==="undefined") log=rtjscomp.log;

{//SET TMP THINGS;
	globals.tmp_head=function(title,inp=null,allowDark=true){
		//log("OLD function tmp_head! please use importHead!")
		const date=new Date();
		const hour=date.getHours()
		let darkStyle=false;
		if(hour>=darkEnabledHours[0]||hour<=darkEnabledHours[1]){
			darkStyle=true;
		}
		if(inp!=null){
			if(inp.darkMode=="always"||inp.dark=="1"){darkStyle=true}
			else if(inp.darkMode=="never"||inp.dark=="0"){darkStyle=false}
		}

		if(darkStyle){
			darkStyle=`\t<link rel=stylesheet href=/css/main.dark.css>\n`
		}else{darkStyle=""}
		if(!title){
			title="";
		}else{
			title=`<title>${title}</title>`
		}
		if(!allowDark){darkStyle=""}
		let res="";
		res+=`${title}\n`
		res+=`\t<link rel="shortcut icon" href=/favicon.png>\n`
		res+=`\t<meta charset=utf-8>\n`
		res+=`\t<meta name=viewport content="width=device-width">\n`
		res+=`\t<meta name=robots content=index>\n`
		res+=`\t<link rel=stylesheet href=/css/main.css>\n`
		res+=darkStyle;
		res+=`\t<script src="${globals.vars["file_import.js"]}"></script>`
		return res;
	}
	globals.tmp_nameAsA=function(attrBoot=null){
		if(attrBoot==null){attrBoot=""}else{attrBoot=" "+attrBoot}
		return(`<abbr title="${myName}"${attrBoot}>${myShortName}</abbr>`);
	}
}

{//SET globals.functions;
	globals.functions={};
	globals.functions.importHead=data=>{
		let {
			autodetect=true,
			botIndexAllow=true,
			css=["/css/main.css?imports=*"],
			cssDark=["/css/main.dark.css"],
			cssLegacy=[],
			description,
			icon="/favicon.png",
			icons,
			input:{
				bot,
				darkMode,
				legacy=false,
				legacyCSS=false,
				user_agent,
				watch,
			},
			keywords,
			manifest,
			script=[],
			scriptLegacy=null,
			tabs=2,
			title,
			watchAllow=false,
		}=data;

		if(user_agent&&autodetect){
			if(user_agent.startsWith("Nokia")){
				legacy=true;
				legacyCSS=true;
			}
		}

		tabs=tabs?Array(tabs).join("\t")+"\t":"";
		let useDark=false;
		if(darkMode=="always"){useDark=true;}
		else if(darkMode=="never"){useDark=false;}
		else if(darkMode=="auto"||!darkMode){
			const date=new Date();
			const hour=date.getHours();
			if(hour>=darkEnabledHours[0]||hour<=darkEnabledHours[1]) useDark=true;
		}
		if(icons){
			icons=Object.keys(icons)
				.map(key=>`${tabs}<link rel=icon sizes=${key.split(" ").join("")} href=${(icons[key].includes(" ")||icons[key].includes("="))?'"'+icons[key]+'"':icons[key]}>`)
				.join("\n")
		}
		if(legacyCSS==1||legacyCSS===true){
			css=cssLegacy;
		}

		if(legacy&&scriptLegacy) script=scriptLegacy;

		let html="";
		html+=legacyCSS==1?"LEGACY":"";
		html+=`<!--Hello ${bot?"Bot":"Developer"}!-->\n`;
		html+=bot&&useDark?"<!--I disabled Dark-Mode for Bots!-->\n":"";
		html+=title?`${tabs}<title>${title}</title>\n`:"";
		html+=tabs+`<meta charset=utf-8>\n${tabs}<meta name=viewport content="width=device-width, initial-scale=1.0">\n`;
		html+=typeof(botIndexAllow)==="boolean"?`${tabs}<meta name=robots content=${botIndexAllow?"":"no"}index>\n`:""
		html+=description?`${tabs}<meta name=description content=${(description.includes(" ")||description.includes("="))?'"'+description+'"':description}>\n`:"";
		html+=(typeof(keywords)==="object"&&keywords.length)?`${tabs}<meta name=keywords content="${keywords.join(", ")}">\n`:""
		html+=icon?(`${tabs}<link rel="shortcut icon" href=${(icon.includes(" ")||icon.includes("="))?'"'+icon+'"':icon}>\n`):"";
		html+=icons?icons+"\n":"";
		html+=manifest?(`${tabs}<link rel=manifest href=${(manifest.includes(" ")||manifest.includes("="))?'"'+manifest+'"':manifest}>\n`):"";
		html+=css?((css.map(url=>`${tabs}<link rel=stylesheet href=${(url.includes(" ")||url.includes("="))?'"'+url+'"':url}>`).join("\n"))+"\n"):"";
		html+=cssDark&&useDark?((cssDark.map(url=>`${tabs}<link rel=stylesheet href=${(url.includes(" ")||url.includes("="))?'"'+url+'"':url}>`).join("\n"))+"\n"):"";
		html+=script?(script.map(url=>`${tabs}<script src=${(url.includes(" ")||url.includes("="))?'"'+url+'"':url}></script>`).join("\n")+"\n"):"";
		html+=(watchAllow&&Number(watch)&&watch>2&&!isNaN(watch))?`${tabs}<meta http-equiv=refresh content=${watch}>`:"";
		html=html.trim();

		return html;
	}
	globals.functions.allowedPath=({request,response},allowedUrl)=>{
		// wont work in services just in dynamic rtjscomp files ;)
		if(request.url.startsWith(allowedUrl)) return;

		let url=allowedUrl;

		if(request.url.includes("#")) url=url+"#"+request.url.split("#")[1];
		else if(request.url.includes("?")) url=url+"?"+request.url.split("?")[1];

		response.setHeader("Location",url);
		throw 302;
	}
	globals.functions.GetDark=function(inp=null){
		let darkStyle=false;
		let date=new Date();
		let hour=date.getHours();
		if(hour>=darkEnabledHours[0]||hour<=darkEnabledHours[1]){
			darkStyle=true;
		}
		if(inp!=null){
			if(inp.darkMode==="always") darkStyle=true;
			else if(inp.darkMode==="never") darkStyle=false;
		}
		return darkStyle;
	}
	globals.functions.ConfigLine=function(fileText,cange){
		let newFile="";
		let line;
		if(typeof(cange)!=="object"){log("[ConfigLine][ERROR]: typeof(cange) is not 'object'!!");return "ERROR typeof(cange) is not 'object' !"}
		for(line of fileText.split("\n")){
			if(line.includes("=")===true&&line.charAt(0)!=="#"&&line.substr(0,2)!=="//"){
				let lineSplited=line.split("=");
				if(lineSplited[0]==cange[0]){
					lineSplited[1]=cange[1];
				}
				newFile=newFile+lineSplited[0]+"="+lineSplited[1]+"\n";

			}
		}
		return(newFile)
	}
	globals.functions.GetLine=function(fileText,lineRead,returnType="all",errorType="log"){
		let result="";

		if(typeof(lineRead)!=="string"){
			if(errorType=="log"){log("[GetLine][WARNING]: option not found!")}
			else if(errorType[0]=="throw"){throw(errorType[1])}
			if(returnType=="all"){
				return("ERROR typeof(lineRead) is not 'string' !");
			}else if(returnType=="simple"){
				return(false);
			}
		}
		let line;
		for(line of fileText.split("\n")){
			if(line.includes("=")==true&&line.charAt(0)!=="#"&&line.substr(0,2)!=="//"){
				let lineSplited=line.split("=");
				if(lineSplited[0]==lineRead){
					result=[lineSplited[0],lineSplited[1]]
					if(returnType=="all"){return(result);}
					else if(returnType=="simple"){return(result[1]);}
				}
			}
		}
		return("ERROR lineRead is not in fileText!");
	}
	globals.functions.GetLineSimple=(configToRead,configVarName)=>{
		const result=configToRead
			.split("\n")
			.filter(line=>
				line.includes("=")==true&&
				line.charAt(0)!=="#"&&
				line.substr(0,2)!=="//"&&
				line.split("=").length==2
			)
			.filter(line=>
				line.split("=")[0]===configVarName
			)
		if(result.length==0){return undefined;}
		else{return result[0].split("=")[1];}
	}
	globals.functions.ReadFile=function(fileName,coding="utf8"){
		try{
			const file=fs.readFileSync(fileName,coding);
			//log("fn: [ReadFile]: read file '"+fileName+"'");
			return file;
		}catch(e){
			//log("fn: [ReadFile]: cant read file '"+fileName+"'");
			return false;
		}
	}
	globals.functions.ReadJsonFile=fileName=>{
		let res=globals.functions.ReadFile(fileName,"utf8");
		try{res=JSON.parse(res)}
		catch(e){res=false;}
		return res;
	}
	globals.functions.WriteFile=function(fileName,fileData="",coding="utf-8"){
		try{
			const file=fs.writeFileSync(fileName,String(fileData),coding);
			//log("fn: [WriteFile]: write file '"+fileName+"'");
			return file;
		}catch(e){
			//log("fn: [WriteFile]: cant write file '"+fileName+"'");
			return false;
		}
	}
	globals.functions.CreateDir=function(dir){
		try{
			fs.mkdirSync(dir);
			//log("fn: [CreateDir]: create dir '"+dir+"'");
			return true;
		}catch(e){
			//log("fn: [CreateDir]: dir already exists '"+dir+"'");
			return false;
		}
	}
	globals.functions.readFileAsync=function(...args){return new Promise(resolve=>{
		fs.readFile(...args,(err,data)=>{
			if(err){console.log(err);resolve(null);return;};
			resolve(data);
			return;
		});
	})}
	globals.functions.renameAsync=function(oldPath,newPath){return new Promise((resolve,reject)=>{
		fs.rename(oldPath,newPath,error=>{
			if(error) reject(error);
			else resolve();
			return;
		});
	})}
	globals.functions.rmFileAsync=function(...args){return new Promise(resolve=>{
		fs.rm(...args,(err)=>{
			if(err){resolve(false);return;};
			resolve(true);
			return;
		});
	})}
	globals.functions.rmDirAsync=function(...args){return new Promise(resolve=>{
		fs.rmdir(...args,(err)=>{
			if(err){console.log(err);resolve(false);return}
			resolve(true);
			return;
		});
	})}
	globals.functions.writeFileAsync=function(...args){return new Promise(resolve=>{
		fs.writeFile(...args,(err)=>{
			if(err) console.log(err);
			resolve(err);
			return;
		});
	})}
	globals.functions.readJsonFileAsync=function(path){return new Promise(async resolve=>{
		const file=await globals.functions.readFileAsync(path,"utf-8")
		if(!file){
			resolve(null);
			return;
		}
		try{
			resolve(JSON.parse(file));
			return;
		}catch(e){
			resolve(null);
			return;
		}
	})}
	globals.functions.writeJsonFileAsync=function(path,data){
		data=JSON.stringify(data,null,"\t")+"\n";
		return globals.functions.writeFileAsync(path,data,"utf-8");
	}
	globals.functions.existsAsync=function(path){return new Promise(resolve=>{
		fs.exists(path,resolve);
	})}
	globals.functions.createDirAsync=function(...args){return new Promise(resolve=>{
		try{
			fs.mkdir(...args,()=>resolve());
		}catch(e){
			resolve(false);
			return;
		}
	})}
	globals.functions.ReadDir=function(dir){
		return(fs.readdirSync(dir));
	}
	globals.functions.decodeBase64=function(textToDecode,to="utf8"){
		return(String(Buffer.from(textToDecode,"base64").toString(to)));
	}
	globals.functions.encodeBase64=function(textToEncode){
		return(String(Buffer.from(textToEncode).toString("base64")));
	}
	globals.functions.codeify=function(text){
		return(globals.functions.REPLACEALL(String(text),[["&","&amp;"],["<","&lt;"],[">","&gt;"],['"',"&quot;"]]));
	}
	globals.functions.REPLACEALL=function(text="Hallo Welt!",replace=[[" ","_"],["!","?"]]){
		if(typeof(replace)!="object"){
			let error="WRONG FORMAT ONLY LISTS ACCSEPTED!"
			console.log(`ERROR in REPLACEALL: "${error}"`)
			throw error;
		}
		let rp;
		text=String(text);
		for(rp of replace){
				text=text.split(rp[0]).join(rp[1]);
		}
		return text;
	}
	globals.functions.xxhash=(str,id=0)=>{
		// require xxhash;
		return xxhash.hash(Buffer.from(String(str)),Number(id));
	}
	globals.functions.random=()=>{
		let randomNum=String(Math.random()).split(".").join("0");
		randomNum=Number(randomNum);
		return(randomNum);
	}
	globals.functions.randomIndex=i=>Math.max(0,Math.round(Math.random()*i))

	globals.functions.AddSearch=(search,value=undefined,sep="&",useCodeify=true)=>{
		if(sep==null){sep="&"}
		if(useCodeify){value=globals.functions.codeify(value)}
		return(sep+search+"="+ESC(value));
	}
	globals.functions.tofsStr=str=>{
		const replace_char="_";
		let allowedChars="ABCDEFGHIJKLMNOPQRSTUVWXYZ";
		allowedChars+="abcdefghijklmnopqrstuvwxyz";
		allowedChars+="01234567890";
		//replace_always=true;
		let result="";
		let char;

		for(char of str){
			let found=false;
			let c;
			for(c of allowedChars){
				if(char==c){
					found=true;
					break;
				}
			}
			if(found){result+=char}
			else if(!found){result+=replace_char}
		}
		return(result);
	}
	globals.functions.decodeParameter=parameter=>{
		parameter=unESC(parameter);
		parameter=globals.functions.codeify(parameter);
		return parameter;
	}
	globals.functions.jsonStringify=(data,nice=true)=>{
		if(nice){return JSON.stringify(data,null,2).split("  ").join("\t")}
		else{return JSON.stringify(data)}
	}
	globals.functions.userAgentToJSON=ua=>{
		const agent=useragent.lookup(ua).toJSON();
		return agent;
	}
	globals.functions.decodeUserAgent=(ua,long=false)=>{
		const agent=globals.functions.userAgentToJSON(ua);
		const browser=agent.family+(agent.major=="0"?"":" "+agent.major);
		const os=agent.os.family+(agent.os.major=="0"?"":" "+agent.os.major);
		return long?`${browser} auf ${os}`:browser;
	}
	globals.functions.datify=(num=Date.now(),format="[day].[month].[year] => [hour]:[minute]")=>{
		const date=new Date(num);
		const lib={
			day:String(date.getDate()).padStart(2,"0"),
			month:String(date.getMonth()+1).padStart(2,"0"),
			year:date.getFullYear(),
			hour:String(date.getHours()).padStart(2,"0"),
			minute:String(date.getMinutes()).padStart(2,"0"),
			second:String(date.getSeconds()).padStart(2,"0"),
		};
		const str="`"+format
			.split("[").join("${lib.")
			.split("]").join("}")+"`";
			try{
				return eval(str);
			}catch(e){return format;}
	}
	globals.functions.jsonParseTry=text=>{
		try{return JSON.parse(text);}
		catch(e){return text;}
	}
	globals.functions.overflowRemove=(text,maxLength,replaceTo="...")=>{
		const length=text.length;
		if(length<=maxLength){return text}
		let t="";
		let index=0;
		let newText="";
		for(t of text){
			index+=1;
			newText+=t;
			if(index>=maxLength){return newText+replaceTo}
		}
	}
}

{//SET GLOBAL PATH/FILES;
	globals.vars={};
	globals.vars["file_import.js"]="/scripts/import.js";
	globals.vars["api_login.api"]="/server/account/login.api";
	globals.vars["api_register.api"]="/server/account/register.api";
	globals.vars["api_test.api"]="/server/test.api";
	globals.vars["api_listDir.api"]="/server/listDir.api";
	globals.vars["api_writeLog.api"]="/server/writeLog.api";
	globals.vars["folder_sounds"]="/files/sounds";
	globals.vars["folder_videos"]="/files/videos";
	globals.vars["folder_img"]="/files/img";
	globals.vars["folder_icon"]="/files/img/icon";
}

{//EDIT path_aliases.txt
	log("EDIT 'path_aliases.txt'...")
	let pathAlias=globals.functions.ReadFile("config/path_aliases.txt");
	let pathAlias_restore=globals.functions.ReadFile("config/path_aliases.restore");
	let folders=globals.functions.ReadDir("public/p/");

	globals.functions.WriteFile("config/path_aliases.txt",pathAlias_restore);
	pathAlias=pathAlias_restore;

	let folder;
	for(folder of folders){
		let folder_path=globals.functions.ReadDir("public/p/"+folder+"/");
		let file;
		let add="\n"
		for(file of folder_path){

			if(file.includes("index")){
				add+=`${folder}:/p/${folder}/${file}\n`;
				add+=`${folder.toLowerCase()}:/p/${folder}/${file}\n`;
			}else{
				add+=`${folder}/${file}:/p/${folder}/${file}\n`;
				add+=`${folder.toLowerCase()}/${file.toLowerCase()}:/p/${folder}/${file}\n`;
				add+=`${folder}/${file.toLowerCase()}:/p/${folder}/${file}\n`;
				add+=`${folder.toLowerCase()}/${file}:/p/${folder}/${file}\n`;
			}
		}
		pathAlias+=add;
		add="";

	}
	globals.functions.WriteFile("config/path_aliases.txt",pathAlias);
	log("EDIT 'path_aliases.txt' FINISH!")
}
