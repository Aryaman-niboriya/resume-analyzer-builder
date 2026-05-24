import datetime
from flask import Blueprint, request, jsonify
from bson.objectid import ObjectId

from db import db

dashboard_bp = Blueprint('dashboard', __name__)


@dashboard_bp.route('/stats', methods=['GET'])
def get_stats():
    """
    Get dashboard stats for the logged-in user.
    Pulls from the 'analyses' and 'resumes' collections.
    """
    # Get user_id from query param or auth header
    user_id = request.args.get('user_id', None)

    stats = {
        "totalAnalyses": 0,
        "averageScore": 0,
        "totalResumesBuilt": 0,
        "interviewsCompleted": 0,
        "recentActivity": [],
        "scoreHistory": [],
    }

    if db is None:
        return jsonify(stats), 200

    try:
        analyses_col = db['analyses']
        resumes_col = db['built_resumes']
        interviews_col = db['interviews']

        # Build query filter
        query = {}
        if user_id:
            query['user_id'] = user_id

        # 1. Count total analyses
        total_analyses = analyses_col.count_documents(query)
        stats["totalAnalyses"] = total_analyses

        # 2. Average score from analyses
        if total_analyses > 0:
            pipeline = [
                {"$match": query},
                {"$group": {"_id": None, "avgScore": {"$avg": "$overall_score"}}}
            ]
            avg_result = list(analyses_col.aggregate(pipeline))
            if avg_result:
                stats["averageScore"] = round(avg_result[0].get("avgScore", 0))

        # 3. Count resumes built
        stats["totalResumesBuilt"] = resumes_col.count_documents(query)

        # 4. Count interviews
        stats["interviewsCompleted"] = interviews_col.count_documents(query)

        # 5. Recent activity (last 10 analyses)
        recent = analyses_col.find(query).sort("created_at", -1).limit(10)
        activity = []
        for doc in recent:
            activity.append({
                "id": str(doc["_id"]),
                "type": "analysis",
                "title": doc.get("job_title", "Resume Analysis"),
                "score": doc.get("overall_score", 0),
                "date": doc.get("created_at", datetime.datetime.utcnow()).isoformat(),
            })
        stats["recentActivity"] = activity

        # 6. Score history for chart (last 10 analyses, oldest first)
        history = analyses_col.find(query).sort("created_at", -1).limit(10)
        score_history = []
        for doc in history:
            score_history.append({
                "date": doc.get("created_at", datetime.datetime.utcnow()).strftime("%b %d"),
                "score": doc.get("overall_score", 0),
            })
        stats["scoreHistory"] = list(reversed(score_history))

    except Exception as e:
        print(f"Dashboard stats error: {e}")

    return jsonify(stats), 200


@dashboard_bp.route('/save-analysis', methods=['POST'])
def save_analysis():
    """
    Save an analysis result to the database for history tracking.
    Called by the frontend after a successful analysis.
    """
    if db is None:
        return jsonify({"error": "Database not available"}), 500

    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    try:
        analyses_col = db['analyses']
        doc = {
            "user_id": data.get("user_id", "anonymous"),
            "job_title": data.get("job_title", "Unknown Role"),
            "overall_score": data.get("overallScore", 0),
            "ats_score": data.get("scoreBreakdown", {}).get("atsCompatibility", 0),
            "skills_match": data.get("scoreBreakdown", {}).get("skillsMatch", 0),
            "report_data": data,
            "created_at": datetime.datetime.utcnow(),
        }
        result = analyses_col.insert_one(doc)
        return jsonify({"message": "Analysis saved", "id": str(result.inserted_id)}), 201
    except Exception as e:
        print(f"Save analysis error: {e}")
        return jsonify({"error": str(e)}), 500

@dashboard_bp.route('/latest-analysis', methods=['GET'])
def get_latest_analysis():
    """
    Get the most recent analysis report for the logged-in user.
    Used to populate Skill Gap and Interview Prep pages.
    """
    user_id = request.args.get('user_id')
    if not user_id:
        return jsonify({"error": "user_id is required"}), 400
        
    if db is None:
        return jsonify({"error": "Database not available"}), 500
        
    try:
        analyses_col = db['analyses']
        latest = analyses_col.find({"user_id": user_id}).sort("created_at", -1).limit(1)
        latest_doc = list(latest)
        
        if not latest_doc:
            return jsonify({"error": "No analyses found"}), 404
            
        report = latest_doc[0].get("report_data", {})
        return jsonify(report), 200
    except Exception as e:
        print(f"Latest analysis error: {e}")
        return jsonify({"error": str(e)}), 500
