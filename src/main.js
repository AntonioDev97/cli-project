import chalk from 'chalk';
import fs from 'fs';
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
            case 'section':
                this.createSection(options);
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

        console.log('%s Project Ready', chalk.green.bold('DONE'));
        return true;
    }

    createSection(options){


        switch(options.endPoint){
            case 'GET':
                console.log("Get Method Cretaed Successfully");
            break; 
            default:
                console.log("default case entry");
            break;
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

    
};