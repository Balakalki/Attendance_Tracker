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
          navigate('/login');
        } else {
          console.error(error);
        }
      }
    };

    fetchSummary();
  }, [navigate]);


  return (
    <div className="flex flex-col gap-4">
      <div></div>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Total Calsses</CardTitle>h
            </div>
          </CardHeader>
          <CardContent>{data?.totalClasses}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Attended Classes</CardTitle>h
            </div>
          </CardHeader>
          <CardContent>{data?.attendedClasses}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Missed Classes</CardTitle>h
            </div>
          </CardHeader>
          <CardContent>
            {data?.totalClasses - data?.attendedClasses}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div className="flex justify-between">
              <CardTitle>Percentage</CardTitle>h
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
      <div className="grid md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Subject Name</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={75} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
