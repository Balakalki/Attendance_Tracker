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
import Loader from "../components/ui/loader";

export default function Dashboard() {
  const [data, setData] = useState();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [totalPercent, setTotalPercent] = useState();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSummary = async () => {
      setLoading(true);
      try {
        const summary = await axios.get(
          `${import.meta.env.VITE_SERVER_URL}/api/summary`,
          { withCredentials: true }
        );
        const newData = summary?.data;
        let totalClasses = 0;
        let attendedClasses = 0;
        const lab = newData.classTime / newData.labTime;
        newData?.subjects?.forEach((sub) => {
          if (sub.type === "lab") {
            sub.total = sub.total * lab;
            sub.attended = sub.attended * lab;
          }
          totalClasses += sub.total;
          attendedClasses += sub.attended;
        });
        setData({ ...newData, totalClasses, attendedClasses });
        setTotalPercent(
          totalClasses === 0 ? 0 : (attendedClasses * 100) / totalClasses
        );
      } catch (error) {
        if (error.response && error.response.status === 401) {
          navigate("/login");
        } else {
          setError("something went wrong");
        }
      }
      setLoading(false);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-red-600 text-xl font-semibold">{error}</p>
      </div>
    );
  }
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
            {(data?.totalClasses ?? 0) - (data?.attendedClasses ?? 0)}
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
            <Badge variant={getPercentageColor(totalPercent)}>
              {data?.totalClasses > 0
                ? totalPercent.toFixed(2) + "%"
                : "No data"}
            </Badge>
          </CardContent>
        </Card>
      </div>
      <div className="flex flex-col gap-4">
        <h2 className="text-2xl font-semibold text-gray-800">
          Subject-wise Attendance
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          {data?.subjects?.map((sub) => {
            const percent =
              sub.total === 0 ? "No Data" : (sub.attended * 100) / sub.total;
            return (
              <Card key={sub._id}>
                <CardHeader>
                  <CardTitle className="flex justify-between">
                    <p>{sub.name}</p>
                    <Badge variant={getPercentageColor(percent)}>
                      {percent === "No Data"
                        ? percent
                        : percent.toFixed(2) + "%"}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className={"flex flex-col gap-4"}>
                  {percent === "No Data" ? (
                    <p>No Data</p>
                  ) : (
                    <p>
                      {sub.attended} classes attended out of {sub.total} classes
                    </p>
                  )}
                  <Progress
                    bg={`${getProgressColor(percent)}`}
                    className={`bg-slate-300`}
                    value={percent}
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
