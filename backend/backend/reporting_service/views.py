
from rest_framework.views import APIView
from rest_framework.response import Response
from .reports.excel import generate_schedule_xlsx
from .reports.pdf import generate_schedule_pdf
from .reports.docx import generate_schedule_docx

class TeachingLoadReportAPIView(APIView):
    def get(self, request):
        return Response({"error": "Unsupported report type"}, status=400)

class ScheduleReportAPIView(APIView):
    def get(self, request):
        report_type = request.query_params.get('type', 'xlsx')
        
        if report_type == 'xlsx':
            return generate_schedule_xlsx()
        elif report_type == 'pdf':
            return generate_schedule_pdf()
        elif report_type == 'docx':
            return generate_schedule_docx()
        
        return Response({"error": "Unsupported report type"}, status=400)
