'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Clock3, FileClock, X } from 'lucide-react';
import {
  type RoadmapCreationReport,
  formatElapsed,
} from '@/features/create-project/model/roadmapCreationReport';

interface Props {
  report: RoadmapCreationReport;
  onClose: () => void;
}

export function RoadmapCreationReportModal({ report, onClose }: Props) {
  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="relative w-full max-w-2xl overflow-hidden rounded-2xl border-2 border-[#333333] bg-[#F5F0EB] shadow-2xl"
          style={{ maxHeight: '90vh' }}
        >
          <div className="flex items-center justify-between border-b-2 border-dashed border-[#CCCCCC] px-6 py-4">
            <div>
              <p className="mb-0.5 text-xs uppercase tracking-widest text-[#5A5C58]">
                Bao cao lan tao roadmap gan nhat
              </p>
              <h2 className="text-lg font-bold text-[#2D2D2D]">{report.projectName}</h2>
            </div>
            <button
              onClick={onClose}
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-2 border-[#333333] transition-colors hover:bg-[#2D2D2D] hover:text-white"
            >
              <X size={14} />
            </button>
          </div>

          <div className="overflow-y-auto p-6" style={{ maxHeight: 'calc(90vh - 88px)' }}>
            <div className="mb-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border-2 border-[#333333] bg-white p-4">
                <div className="mb-2 flex items-center gap-2 text-[#5A5C58]">
                  <Clock3 size={14} />
                  <span className="text-xs font-semibold uppercase tracking-wider">Tong thoi gian</span>
                </div>
                <p className="text-lg font-black text-[#2D2D2D]">
                  {formatElapsed(report.totalElapsedMs) ?? 'Chua co'}
                </p>
              </div>

              <div className="rounded-xl border-2 border-[#333333] bg-white p-4">
                <div className="mb-2 flex items-center gap-2 text-[#5A5C58]">
                  <FileClock size={14} />
                  <span className="text-xs font-semibold uppercase tracking-wider">Upload</span>
                </div>
                <p className="text-lg font-black text-[#2D2D2D]">
                  {formatElapsed(report.uploadElapsedMs) ?? 'Khong co'}
                </p>
              </div>

              <div className="rounded-xl border-2 border-[#333333] bg-white p-4">
                <div className="mb-2 flex items-center gap-2 text-[#5A5C58]">
                  <span className="text-xs font-semibold uppercase tracking-wider">Trang thai</span>
                </div>
                <p className="text-lg font-black text-[#2D2D2D]">
                  {report.status === 'completed'
                    ? 'Hoan tat'
                    : report.status === 'failed'
                      ? 'That bai'
                      : 'Dang chay'}
                </p>
              </div>
            </div>

            <div className="mb-4 rounded-xl border-2 border-[#333333] bg-white p-4">
              <div className="mb-1.5 flex items-center justify-between text-xs font-semibold text-[#5A5C58]">
                <span>Tao roadmap realtime</span>
                <span>{report.roadmapPercent}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-[#E5E5DF]">
                <div
                  className="h-full rounded-full bg-[#4CD964] transition-all duration-300"
                  style={{ width: `${report.roadmapPercent}%` }}
                />
              </div>
              {report.roadmapStatusMessage ? (
                <p className="mt-1.5 text-[11px] text-[#2D2D2D]">{report.roadmapStatusMessage}</p>
              ) : null}
              {report.errorMessage ? (
                <p className="mt-1.5 text-[11px] text-red-600">{report.errorMessage}</p>
              ) : null}
            </div>

            <div className="space-y-1.5">
              {report.progressStages.map((stage) => (
                <div
                  key={stage.key}
                  className="flex items-center justify-between rounded-lg border border-[#E5E5DF] bg-white px-3 py-2 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${
                        stage.status === 'done'
                          ? 'bg-[#4CD964]'
                          : stage.status === 'active'
                            ? 'bg-[#F59E0B]'
                            : 'bg-[#D1D5DB]'
                      }`}
                    />
                    <div>
                      <p className="font-semibold text-[#2D2D2D]">{stage.label}</p>
                      {stage.message ? (
                        <p className="text-[10px] text-[#5A5C58]">{stage.message}</p>
                      ) : null}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-[#5A5C58]">
                      {stage.status === 'done'
                        ? 'Xong'
                        : stage.status === 'active'
                          ? 'Dang chay'
                          : 'Cho'}
                    </p>
                    {stage.elapsedMs ? (
                      <p className="text-[10px] text-[#9CA3AF]">{formatElapsed(stage.elapsedMs)}</p>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export default RoadmapCreationReportModal;
