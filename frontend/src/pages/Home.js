import StudentForm from "../components/StudentForm";
import ReportViewer from "../components/ReportViewer";

function Home(props) {
  return (
    <div>
      <StudentForm {...props} />
      <ReportViewer report={props.report} />
    </div>
  );
}

export default Home;
