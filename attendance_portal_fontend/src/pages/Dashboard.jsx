import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Progress } from "../components/ui/progress";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Badge } from "../components/ui/badge";
export default function Dashboard() {
  const [data, setData] = useState();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const summary = await axios.get(
          `${import.meta.env.VITE_SERVER_URL}/api/summary`,
          { withCredentials: true }
        );
        setData(summary?.data?.data);
      } catch (error) {
        if (error.response && error.response.status === 401) {
          navigate("/login");
        } else {
          console.error(error);
        }
      }
    };

    fetchSummary();
  }, [navigate]);

  const getPercentageColor = (percentage) => {
    if (percentage >= 75) return "success";
    if (percentage >= 65) return "warning";
    if (isNaN(percentage)) return "";
    return "danger";
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 85) return "bg-green-500";
    if (percentage >= 75) return "bg-amber-500";
    if (isNaN(percentage)) return "";
    return "bg-red-500";
  };

  if (!data) return <p>Loading...</p>;
  return (
    <div className="flex flex-col gap-4">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Welcome back! Here's your attendance overview.
        </p>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Total Calsses</CardTitle>
              <div>📚</div>
            </div>
          </CardHeader>
          <CardContent>{data?.totalClasses}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Attended Classes</CardTitle>
              <div>✅</div>
            </div>
          </CardHeader>
          <CardContent>{data?.attendedClasses}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Missed Classes</CardTitle>
              <div>❌</div>
            </div>
          </CardHeader>
          <CardContent>
            {data?.totalClasses - data?.attendedClasses}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div className="flex justify-between">
              <CardTitle>Percentage</CardTitle>
              <div>📊</div>
            </div>
          </CardHeader>
          <CardContent>
            {data?.totalClasses > 0
              ? ((data.attendedClasses * 100) / data.totalClasses).toFixed(2) +
                "%"
              : "No data"}
          </CardContent>
        </Card>
      </div>
      <div className="flex flex-col gap-4">
        <h2 className="text-2xl font-semibold text-gray-800">
          Subject-wise Attendance
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          {data?.subjects.map((sub) => {
            const percent =
              sub.total === 0 ? "No Data" : (sub.present * 100) / sub.total;

            const numericPercent = parseFloat(percent);

            return (
              <Card key={sub.subjectId}>
                <CardHeader>
                  <CardTitle className="flex justify-between">
                    <p>{sub.subjectName}</p>
                    <Badge variant={getPercentageColor(percent)}>
                      {percent === "No Data"
                        ? percent
                        : percent.toFixed(2) + "%"}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className={'flex flex-col gap-4'}>
                  <p>{sub.present} classes attended out of {sub.total} classes</p>
                  <Progress
                    bg="bg-green-700"
                    className={`bg-slate-300 ${getProgressColor(percent)}`}
                    value={numericPercent}
                  />
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
