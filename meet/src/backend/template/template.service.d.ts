export declare class TemplateService {
  readonly templates_dir: string;
  compileTemplate(path: string): import('ejs').TemplateFunction;
  getAllTemplates(): {};
  getAllCategoryTemplates(category: string): {
    [Symbol.iterator]: () => Generator<any[], void, unknown>;
  };
}
