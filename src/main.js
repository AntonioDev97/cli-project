import chalk from 'chalk';
import fs, { existsSync, write } from 'fs';
import ncp from 'ncp';
import path from 'path';
import { promisify } from 'util';
import execa from 'execa';
import Listr from 'listr';
import { projectInstall } from 'pkg-install';

const access = promisify(fs.access);
const copy = promisify(ncp);

export class processMain{

    constructor(options){

        this.initMain(options);
        
        if(!options.generate && !options.component && options.component_name){
            console.log(`%s Invalid option \n Please we only have an option -g or --generate or use simple 'qatar' command`, chalk.yellow.bold('INFO'));
            process.exit(1);
        }

        switch(options.component){
            case 'module':
                this.createModule(options);
            break;
            case 'endPoint':
                this.createEndPoint(options);
            break;
            case 'controller':
                this.createController(options);
            break;
            default:
                console.error(`%s Invalid component. Please try again`, chalk.red.bold('ERROR'));
                process.exit(1);
            break;
        }    
        
    }

    async initMain(options){
        try{
            options.templateDirectory = path.resolve(__dirname, '../templates', options.component.toLowerCase());
            options.route ? options.targetDirectory = process.cwd() + options.route : options.targetDirectory = process.cwd();

            await access(options.templateDirectory, fs.constants.R_OK)
        } catch(error){
            console.error(`%s Invalid template name ${options.templateDirectory} ${error}`, chalk.red.bold('ERROR'));
            process.exit(1);
        }
    }

    async createModule(options){

        const task = new Listr([
            {
                title: 'Create New Module Folder',
                task: () => this.createDirectory(options)
            },
            {
                title: 'Copy Module Files',
                task: () => this.copyTemplateFiles(options)
            }
        ]);

        try{
        await task.run();
        } catch(err){
            console.error('%s ' + err.message, chalk.red.bold("ERROR"));
            process.exit(1);
        }

        console.log('%s Module Ready', chalk.green.bold('DONE'));
        return true;
    }

    async createEndPoint(options){
        if(!fs.existsSync('routes')){ 
            console.error(`%s Can't create end point, Please create a module first and try again`, chalk.red.bold("ERROR"));
            process.exit(1);
        }
        if(options.component == "endPoint" && options.endPoint){
            const task = new Listr([
                {
                    title: "Create controller",
                    task: () => this.createController(options)
                },
                {
                    title: "Create routes",
                    task: () => this.createRoutes(options)
                }
            ]);

            try{
                await task.run();
            }catch(error){
                console.error('%s ' + error.message, chalk.red.bold("ERROR"));
                process.exit(1);
            }
        }
        else {
            console.error(`%s Can't create end point, Try again`, chalk.red.bold("ERROR"));
            process.exit(1);
        }
    }

    async createDirectory(options){
        if(fs.existsSync(options.component_name))
            throw new Error(`Directory "${options.component_name}" already exists verify and try again.`, chalk.red.bold("ERROR"));
        
        return fs.mkdirSync(`${options.targetDirectory}/${options.component_name}`);       
    }

    copyTemplateFiles(options){
        return copy(options.templateDirectory, `${options.targetDirectory}/${options.component_name}`, {
            clobber: false
        });
    }

    //End Point Methods
    createController(options){

        /* if(fs.existsSync(`${options.targetDirectory}/controllers/${options.component_name.toLowerCase()}.js`))
            throw new Error(`Controller "${options.component_name}" already exists verify and try again.`, chalk.red.bold("ERROR")); */

        let writeLine = "";
        let exportText = "";
        const subject = options.component_name.charAt(0).toUpperCase()+options.component_name.slice(1);
        options.endPoint.forEach( method => {
            switch(method){
                case 'GET':
                    writeLine += `const get${subject} = (request, response) => {\n\treturn response.status(200).send({message: 'working'})\n}\n\n` 
                    exportText += `\tget${subject},\n`;
                break;
                case 'POST':
                    writeLine += `const post${subject} = (request, response) => {\n\treturn response.status(200).send({message: 'working'})\n}\n\n` 
                    exportText += `\tpost${subject},\n`;
                break;  
                case 'PUT':
                    writeLine += `const update${subject} = (request, response) => {\n\treturn response.status(200).send({message: 'working'})\n}\n\n` 
                    exportText += `\tupdate${subject},\n`;
                break;  
                case 'DELETE':
                    writeLine += `const delete${subject} = (request, response) => {\n\treturn response.status(200).send({message: 'working'})\n}\n\n` 
                    exportText += `\tdelete${subject},\n`;
                break;  
                case 'OPTIONS':
                    writeLine += `const option${subject} = (request, response) => {\n\treturn response.status(200).send({message: 'working'})\n}\n\n` 
                    exportText += `\toption${subject},\n`;
                break;
                case 'HEAD':
                    writeLine += `const head${subject} = (request, response) => {\n\treturn response.status(200).send({message: 'working'})\n}\n\n` 
                    exportText += `\thead${subject},\n`;
                break;    
                default:
                    console.log("default case entry");
                break;
            }
        });

        const file = `${options.targetDirectory}/controllers/${options.component_name.toLowerCase()}.js`;
        let finalData = writeLine;

        if(fs.existsSync(file)){
            let data = fs.readFileSync(file).toString().split("module.exports");
            let exportPart = data[1].split('}');
            data[1] = exportPart[0] + exportText + '}' + exportPart[1];
            finalData = data[0] + writeLine + `module.exports${data[1]}`;
        }
        else finalData = "'use strict'\n\n" + writeLine + `module.exports={\n${exportText}};`;

        fs.writeFileSync(file, finalData);
        
    }

    createRoutes(options){
        const file = `${options.targetDirectory}/routes/${options.component_name.toLowerCase()}.js`;
        const subject = options.component_name.charAt(0).toUpperCase()+options.component_name.slice(1);
        let writeLine = "";
        options.endPoint.forEach(method =>{
            writeLine += `api.${method.toLowerCase()}('/${method.toLowerCase()}${subject}', ${subject}Controller.${method.toLowerCase()}${subject});\n`;
        });
        
        if(fs.existsSync(file)){
            let data = fs.readFileSync(file).toString().split("module.exports");
            writeLine = data[0]+writeLine+`\nmodule.exports${data[1]}`;
        }
        else{ 
            let imports = `const express = require('express');\n\nconst ${subject}Controller = require('../controllers/${subject.toLowerCase()}');\n\n`;
            writeLine = `'use strict'\n\n${imports}${writeLine}\nmodule.exports = api;`;
        }
        fs.writeFileSync(file, writeLine)
    }

    
};