import Link from 'next/link';
import { Folder, Users, ChevronRight, Plus } from 'lucide-react';
import { projects, sharedCourses } from '@/lib/data';

export default function HomePage() {
  return (
    <div className="max-w-[1200px] mx-auto px-6 py-8">
      {/* Hero Welcome Card - partially visible top */}
      <div className="w-full bg-[#2D2D2D] rounded-2xl p-8 mb-8 relative overflow-hidden">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[#9CA3AF] text-sm mb-2 uppercase tracking-widest">Welcome back</p>
            <h1 className="text-white text-4xl font-bold leading-tight mb-3">
              Ready to learn<br />something new today?
            </h1>
            <p className="text-[#9CA3AF] text-base max-w-md">
              Continue your learning journey with interactive mindmaps and curated course content.
            </p>
          </div>
          <div className="hidden md:block">
            <div className="w-32 h-32 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center">
              <span className="text-5xl">📚</span>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#4CD964]" />
            <span className="text-[#9CA3AF] text-sm">3 Active Projects</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#818CF8]" />
            <span className="text-[#9CA3AF] text-sm">3 Shared Courses</span>
          </div>
        </div>

        {/* Decorative dots */}
        <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-white/20" />
        <div className="absolute top-8 right-8 w-1.5 h-1.5 rounded-full bg-white/10" />
        <div className="absolute top-6 right-16 w-1 h-1 rounded-full bg-white/15" />
      </div>

      {/* Top action row */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Folder size={20} className="text-[#2D2D2D]" />
          <h2 className="text-xl font-bold text-[#2D2D2D]">My Projects</h2>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-[#2D2D2D] text-white rounded-full hover:bg-[#1a1a1a] transition-colors">
          <span className="w-5 h-5 rounded-full bg-[#4CD964] flex items-center justify-center flex-shrink-0">
            <Plus size={12} className="text-[#2D2D2D]" strokeWidth={3} />
          </span>
          <span className="text-sm font-medium">New Project</span>
        </button>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        {projects.map((project) => (
          <div
            key={project.id}
            className="bg-[#F1F1EC] border-2 border-[#333333] rounded-2xl p-5 flex flex-col gap-4 hover:border-[#2D2D2D] transition-colors cursor-pointer group"
          >
            {/* Card header */}
            <div>
              <h3 className="font-bold text-[#2D2D2D] text-base mb-2 group-hover:text-[#6B2D3E] transition-colors">
                {project.title}
              </h3>
              <p className="text-[#5A5C58] text-sm leading-relaxed">
                {project.description}
              </p>
            </div>

            {/* Dashed separator */}
            <div className="border-t-2 border-dashed border-[#CCCCCC]" />

            {/* Card footer */}
            <div className="flex items-center justify-between">
              <span className="text-[#5A5C58] text-xs font-medium uppercase tracking-wider">
                {project.date}
              </span>
              {project.isComplete ? (
                <span
                  className="text-[#6B2D3E] text-base"
                  style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontStyle: 'italic' }}
                >
                  complete
                </span>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 rounded-full bg-[#E5E7EB] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#4CD964] transition-all"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                  <span className="text-[#5A5C58] text-xs">{project.progress}%</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Courses Shared with Me */}
      <div className="flex items-center gap-2 mb-5">
        <Users size={20} className="text-[#2D2D2D]" />
        <h2 className="text-xl font-bold text-[#2D2D2D]">Courses shared with Me</h2>
      </div>

      <div className="flex flex-col gap-3">
        {sharedCourses.map((course) => (
          <Link
            key={course.id}
            href="/learn"
            className="flex items-center justify-between px-6 py-4 bg-[#F1F1EC] border-2 border-[#333333] rounded-full hover:border-[#2D2D2D] hover:bg-[#EBEBE5] transition-all group"
          >
            <div>
              <span className="font-semibold text-[#2D2D2D] text-sm group-hover:text-[#6B2D3E] transition-colors">
                {course.title}
              </span>
              <span className="text-[#5A5C58] text-sm ml-3">
                Shared by <span className="font-medium">{course.sharedBy}</span> • {course.timeAgo}
              </span>
            </div>
            <ChevronRight size={18} className="text-[#5A5C58] group-hover:text-[#2D2D2D] transition-colors flex-shrink-0" />
          </Link>
        ))}
      </div>
    </div>
  );
}
