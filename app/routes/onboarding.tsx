import anime from "animejs";
import { ArrowRight, Building2, Check, Cloud, FolderGit2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import { createOrganization, createProject, isOnboarded } from "~/lib/store";

export function meta() {
  return [{ title: "Get Started - CloudiFlow-9000" }];
}

type Step = "org" | "project";

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("org");
  const [orgName, setOrgName] = useState("");
  const [projectName, setProjectName] = useState("");
  const [orgId, setOrgId] = useState("");
  const stepRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOnboarded()) {
      navigate("/dashboard", { replace: true });
      return;
    }
    anime({
      targets: ".onboard-fade",
      opacity: [0, 1],
      translateY: [30, 0],
      duration: 700,
      delay: anime.stagger(80),
      easing: "easeOutCubic",
    });
  }, [navigate]);

  useEffect(() => {
    if (stepRef.current) {
      anime({
        targets: stepRef.current.querySelectorAll(".step-item"),
        opacity: [0, 1],
        translateY: [20, 0],
        duration: 500,
        delay: anime.stagger(60),
        easing: "easeOutCubic",
      });
    }
  }, []);

  const handleOrgSubmit = () => {
    const name = orgName.trim();
    if (!name) return;
    const org = createOrganization(name);
    setOrgId(org.id);
    setStep("project");
  };

  const handleProjectSubmit = () => {
    const name = projectName.trim();
    if (!name || !orgId) return;
    const project = createProject(orgId, name);
    if (project) {
      navigate(`/org/${orgId}/project/${project.id}`, { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#e3e3e3] flex flex-col">
      {/* Header */}
      <header className="h-16 border-b border-[#151515] flex items-center px-8">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#f38020] to-[#e06000] flex items-center justify-center">
            <Cloud className="w-4 h-4 text-white" />
          </div>
          <span className="text-[15px] font-semibold text-white tracking-tight">
            CloudiFlow-9000
          </span>
        </div>
      </header>

      {/* Progress */}
      <div className="max-w-lg mx-auto w-full px-8 pt-12">
        <div className="onboard-fade flex items-center gap-3 mb-12">
          <div
            className={`flex items-center gap-2 text-[13px] font-medium ${step === "org" ? "text-[#f38020]" : "text-[#555]"}`}
          >
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-semibold ${
                step === "org"
                  ? "bg-[#f38020] text-white"
                  : "bg-[#1a1a1a] border border-[#333] text-[#555]"
              }`}
            >
              {step === "project" ? <Check className="w-3.5 h-3.5" /> : "1"}
            </div>
            Organization
          </div>
          <div className="flex-1 h-px bg-[#1f1f1f]" />
          <div
            className={`flex items-center gap-2 text-[13px] font-medium ${step === "project" ? "text-[#f38020]" : "text-[#555]"}`}
          >
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-semibold ${
                step === "project"
                  ? "bg-[#f38020] text-white"
                  : "bg-[#1a1a1a] border border-[#333] text-[#555]"
              }`}
            >
              2
            </div>
            Project
          </div>
        </div>
      </div>

      {/* Step content */}
      <div ref={stepRef} className="max-w-lg mx-auto w-full px-8 flex-1">
        {step === "org" && (
          <div>
            <div className="step-item flex items-center gap-3 mb-2">
              <Building2 className="w-5 h-5 text-[#f38020]" />
              <h2 className="text-xl font-semibold text-white">
                Create your organization
              </h2>
            </div>
            <p className="step-item text-[14px] text-[#666] mb-8">
              An organization groups your infrastructure projects together. Use
              your name or team name.
            </p>

            <div className="step-item mb-6">
              <label
                htmlFor="onboarding-org-name"
                className="block text-[12px] font-medium text-[#999] uppercase tracking-wider mb-2"
              >
                Organization name
              </label>
              <input
                id="onboarding-org-name"
                type="text"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleOrgSubmit()}
                placeholder="e.g. My Workspace, Acme Corp"
                className="w-full px-4 py-3 bg-[#111] border border-[#222] rounded-xl text-[14px] text-white placeholder-[#444] focus:outline-none focus:border-[#f38020] transition-colors"
              />
            </div>

            <button
              type="button"
              onClick={handleOrgSubmit}
              disabled={!orgName.trim()}
              className="step-item group inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#f38020] to-[#e06000] hover:from-[#ff9030] hover:to-[#f07010] text-white rounded-xl text-[14px] font-medium transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_4px_20px_rgba(243,128,32,0.2)]"
            >
              Continue
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
        )}

        {step === "project" && (
          <div>
            <div className="step-item flex items-center gap-3 mb-2">
              <FolderGit2 className="w-5 h-5 text-[#f38020]" />
              <h2 className="text-xl font-semibold text-white">
                Create your first project
              </h2>
            </div>
            <p className="step-item text-[14px] text-[#666] mb-8">
              Each project represents an infrastructure deployment with its own
              canvas and generated code. You'll choose a cloud provider inside
              the editor.
            </p>

            <div className="step-item">
              <label
                htmlFor="onboarding-project-name"
                className="block text-[12px] font-medium text-[#999] uppercase tracking-wider mb-2"
              >
                Project name
              </label>
              <input
                id="onboarding-project-name"
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleProjectSubmit()}
                placeholder="e.g. Core Network, API Gateway"
                className="w-full px-4 py-3 bg-[#111] border border-[#222] rounded-xl text-[14px] text-white placeholder-[#444] focus:outline-none focus:border-[#f38020] transition-colors"
              />
            </div>

            <div className="step-item mt-8 flex items-center gap-4">
              <button
                type="button"
                onClick={handleProjectSubmit}
                disabled={!projectName.trim()}
                className="group inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#f38020] to-[#e06000] hover:from-[#ff9030] hover:to-[#f07010] text-white rounded-xl text-[14px] font-medium transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_4px_20px_rgba(243,128,32,0.2)]"
              >
                Create & Open Editor
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </button>
              <Link
                to="/dashboard"
                className="text-[13px] text-[#666] hover:text-white transition-colors"
              >
                Skip
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
