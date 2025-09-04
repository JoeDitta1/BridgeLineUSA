import React from "react";
import JobStatusCard from "../components/JobStatusCard";

export default function JobDetail() {
  return (
    <div className="p-6">
      <JobStatusCard
        soNumber="S-3501"
        poNumber="8168496-1"
        overallStatus="on_track"
        routers={[
          { name: "Sawing",  status: "on_track",        active: true,  elapsedMin: 22, estMin: 30 },
          { name: "Fitting", status: "falling_behind",  active: false, elapsedMin: 48, estMin: 40 },
          { name: "Welding", status: "late",            active: true,  elapsedMin: 95, estMin: 60 },
        ]}
      />
    </div>
  );
}
