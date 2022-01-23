import { Injectable } from '@nestjs/common';
import { compile } from 'ejs';
import { readdirSync, readFileSync } from 'fs';
import { extname, join } from 'path';

@Injectable()
export class TemplateService {
    public readonly templates_dir = join(process.cwd(), 'client', 'private', 'templates');

    compileTemplate(path: string) {
        return compile(readFileSync(join(this.templates_dir, path)).toString());
    }
    getAllTemplates() {
        const templates = {};
        for (const category of readdirSync(this.templates_dir)) {
            if (extname(category) !== "") return; templates[category] = {};
            for (const [template, template_function] of this.getAllCategoryTemplates(category))
                templates[category][template] = template_function;
        }
        return templates;
    }
    getAllCategoryTemplates(category: string) {
        const templates = {
            [Symbol.iterator]: function* () {
                for (const key of Object.keys(this))
                    yield [key, this[key]];
            }
        };
        for (const template of readdirSync(join(this.templates_dir, category)))
            templates[template.split(".")[0]] = this.compileTemplate(`${category}/${template}`);
        return templates;
    }
}
