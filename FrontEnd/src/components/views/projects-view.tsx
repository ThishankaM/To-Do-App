import { useState, useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import { Plus, Search } from "lucide-react";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { ProjectModal } from "@/components/projects/ProjectModal";
import { EmptyState } from "@/components/states/empty-state";
import { ErrorState } from "@/components/states/error-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { WorkspaceViewContext } from "@/types/views";
import type { Project, CreateProjectRequest, ProjectStatus } from "@/types/project";
import { useProjects } from "@/hooks/use-projects";
import { LoadingState } from "@/components/states/loading-state";

function isStatusFilter(value: string): value is ProjectStatus | "all" {
  return (
    value === "all" ||
    value === "active" ||
    value === "completed" ||
    value === "archived"
  );
}

export default function ProjectsView() {
  const { onUpdateParams } = useOutletContext<WorkspaceViewContext>();
  const {
    projects,
    isLoading,
    isError,
    error,
    createProject,
    updateProject,
    deleteProject,
    isSaving,
    deletingId,
  } = useProjects(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | "all">("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const filtered = useMemo(() => {
    return projects.filter((p) => {
      const matchesSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || (p.description && p.description.toLowerCase().includes(search.toLowerCase()));
      const matchesStatus = statusFilter === "all" || p.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [projects, search, statusFilter]);

  const handleSave = async (payload: CreateProjectRequest) => {
    setModalError(null);
    const result = editingProject ? await updateProject(editingProject.id, payload) : await createProject(payload);
    if (!result.ok) {
      setModalError(result.error ?? "Failed");
      return false;
    }
    setIsModalOpen(false);
    setEditingProject(null);
    return true;
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this project? Tasks will be detached, not deleted.")) return;
    await deleteProject(id);
  };

  if (isError) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <ErrorState title="Couldn't load projects" message={error ?? "Unknown"} onRetry={() => window.location.reload()} />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-y-auto">
      <div className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur p-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-foreground">Projects</h1>
            <p className="text-sm text-muted-foreground">{projects.length} projects • {filtered.length} shown</p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
              <Input
                placeholder="Search projects..."
                value={search}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
                className="pl-8 w-56"
              />
            </div>

            <Select
              value={statusFilter}
              items={{ all: "All", active: "Active", completed: "Completed", archived: "Archived" }}
              onValueChange={(v) => {
                if (isStatusFilter(v)) setStatusFilter(v);
              }}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>

            <Button
              onClick={() => {
                setEditingProject(null);
                setModalError(null);
                setIsModalOpen(true);
              }}
            >
              <Plus size={16} /> New Project
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {isLoading ? (
          <LoadingState message="Loading projects..." />
        ) : filtered.length === 0 ? (
          <EmptyState
            title={search || statusFilter !== "all" ? "No matching projects" : "No projects yet"}
            message={search ? `No projects match "${search}"` : "Create your first project to group tasks. Example: TaskFlow Website, AgroTrace, University."}
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                isDeleting={deletingId === project.id}
                onEdit={(p) => {
                  setEditingProject(p);
                  setModalError(null);
                  setIsModalOpen(true);
                }}
                onDelete={handleDelete}
                onSelect={(p) => {
                  setSelectedProject(p);
                  onUpdateParams({ projectId: p.id, page: 1 });
                  window.location.pathname = "/tasks";
                }}
              />
            ))}
          </div>
        )}

        {selectedProject && (
          <div className="mt-8 rounded-xl border border-border bg-card p-5">
            <h3 className="font-medium text-foreground">Selected: {selectedProject.name}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Filter applied: showing tasks for this project in My Tasks. Go to My Tasks to see them.
            </p>
          </div>
        )}
      </div>

      <ProjectModal
        isOpen={isModalOpen}
        isSaving={isSaving}
        editingProject={editingProject}
        serverError={modalError}
        onClose={() => {
          setIsModalOpen(false);
          setEditingProject(null);
        }}
        onSave={handleSave}
      />
    </div>
  );
}
