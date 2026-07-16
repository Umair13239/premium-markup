import { ProjectEditor, type ProjectFormData } from "@/components/admin/project-editor";

const empty: ProjectFormData = {
  name: "", slug: "", sector: "", location: "", url: "", year: "",
  services: "", summary: "", challenge: "", solution: "", resultsText: "",
  image: "", status: "draft", featured: false, relatedService: "", order: 0, seoTitle: "", seoDescription: "",
};

export default function NewProjectPage() {
  return <ProjectEditor initial={empty} />;
}
