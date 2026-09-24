"""
CardioPredict - FastAPI Backend

Loads trained cardio_model.pkl and provides POST /predict for cardiovascular risk prediction,
along with /model-info and /stats endpoints for dashboard metrics.
"""

import os
from typing import Optional, List
import joblib
import pandas as pd
import numpy as np
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field


# ============================================================
# CREATE FASTAPI APP
# ============================================================

app = FastAPI(
    title="CardioPredict Inference API",
    description="Machine Learning API for Cardiovascular Disease (CVD) Detection",
    version="1.0.0"
)


# ============================================================
# CORS MIDDLEWARE
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# LOAD TRAINED MODEL AT STARTUP
# ============================================================

MODEL_PATH = os.path.join(
    os.path.dirname(os.path.abspath(__file__)),
    "cardio_model.pkl"
)

try:
    model = joblib.load(MODEL_PATH)
    print(f"Cardio model loaded successfully from {MODEL_PATH}")
except Exception as e:
    model = None
    print(f"ERROR: Could not load cardio_model.pkl: {e}")


# ============================================================
# INPUT DATA MODEL (PYDANTIC)
# ============================================================

class PatientFeatures(BaseModel):
    # Accept age_years or age (if age in days is provided, backend normalizes)
    age_years: Optional[float] = Field(
        None,
        description="Age of patient in years (1 - 120)"
    )
    age: Optional[float] = Field(
        None,
        description="Age of patient (either in years e.g. 50 or in days e.g. 18250)"
    )
    gender: int = Field(
        ...,
        description="1 = Female, 2 = Male"
    )
    height: float = Field(
        ...,
        gt=0,
        description="Height in cm"
    )
    weight: float = Field(
        ...,
        gt=0,
        description="Weight in kg"
    )
    ap_hi: int = Field(
        ...,
        description="Systolic blood pressure (mmHg)"
    )
    ap_lo: int = Field(
        ...,
        description="Diastolic blood pressure (mmHg)"
    )
    cholesterol: int = Field(
        ...,
        ge=1,
        le=3,
        description="1 = Normal, 2 = Above Normal, 3 = Well Above Normal"
    )
    gluc: int = Field(
        ...,
        ge=1,
        le=3,
        description="1 = Normal, 2 = Above Normal, 3 = Well Above Normal"
    )
    smoke: int = Field(
        ...,
        ge=0,
        le=1,
        description="0 = No, 1 = Yes"
    )
    alco: int = Field(
        ...,
        ge=0,
        le=1,
        description="0 = No, 1 = Yes"
    )
    active: int = Field(
        ...,
        ge=0,
        le=1,
        description="0 = No, 1 = Yes"
    )


# ============================================================
# HEALTH CHECK ENDPOINTS
# ============================================================

@app.get("/")
@app.get("/health")
@app.get("/api/health")
def health_check():
    return {
        "status": "ok",
        "service": "CardioPredict Inference API",
        "model_loaded": model is not None,
        "features_expected": [
            "age_years", "gender", "height", "weight", "ap_hi", "ap_lo",
            "cholesterol", "gluc", "smoke", "alco", "active"
        ]
    }


# ============================================================
# MODEL & DATASET METRICS ENDPOINT (FOR DASHBOARD)
# ============================================================

@app.get("/model-info")
@app.get("/api/model-info")
def get_model_info():
    if model is None:
        raise HTTPException(status_code=500, detail="Model not loaded")

    feature_names = [
        "age_years", "gender", "height", "weight", "ap_hi", "ap_lo",
        "cholesterol", "gluc", "smoke", "alco", "active"
    ]
    
    coef_map = {}
    mean_map = {}
    scale_map = {}
    
    try:
        lr = model.named_steps.get("logistic_regression")
        scaler = model.named_steps.get("scaler")
        
        if lr is not None and hasattr(lr, "coef_"):
            for name, val in zip(feature_names, lr.coef_[0]):
                coef_map[name] = round(float(val), 4)
                
        if scaler is not None and hasattr(scaler, "mean_"):
            for name, m, s in zip(feature_names, scaler.mean_, scaler.scale_):
                mean_map[name] = round(float(m), 2)
                scale_map[name] = round(float(s), 2)
    except Exception as e:
        print(f"Could not extract coefficients: {e}")

    return {
        "model_architecture": "StandardScaler + LogisticRegression(max_iter=2000)",
        "dataset": "Kaggle Cardiovascular Disease Dataset (70,000 Patient Records)",
        "training_records": 70000,
        "feature_count": 11,
        "target_variable": "cardio (0 = Healthy, 1 = CVD Present)",
        "accuracy_approx": "73.2%",
        "auc_roc": "0.79",
        "feature_names": feature_names,
        "coefficients": coef_map,
        "feature_means": mean_map,
        "feature_scales": scale_map,
        "feature_descriptions": {
            "age_years": {"name": "Age", "type": "Continuous", "unit": "Years", "impact": "High Positive (+0.368)"},
            "gender": {"name": "Gender", "type": "Categorical", "unit": "1: Female, 2: Male", "impact": "Neutral (+0.008)"},
            "height": {"name": "Height", "type": "Continuous", "unit": "cm", "impact": "Slight Negative (-0.048)"},
            "weight": {"name": "Weight", "type": "Continuous", "unit": "kg", "impact": "Moderate Positive (+0.222)"},
            "ap_hi": {"name": "Systolic BP", "type": "Continuous", "unit": "mmHg", "impact": "Dominant Positive (+6.037)"},
            "ap_lo": {"name": "Diastolic BP", "type": "Continuous", "unit": "mmHg", "impact": "Slight Positive (+0.057)"},
            "cholesterol": {"name": "Cholesterol", "type": "Ordinal", "unit": "1: Normal, 2: Above, 3: High", "impact": "High Positive (+0.356)"},
            "gluc": {"name": "Glucose", "type": "Ordinal", "unit": "1: Normal, 2: Above, 3: High", "impact": "Slight Negative (-0.068)"},
            "smoke": {"name": "Smoking", "type": "Binary", "unit": "0: No, 1: Yes", "impact": "Risk Factor"},
            "alco": {"name": "Alcohol", "type": "Binary", "unit": "0: No, 1: Yes", "impact": "Risk Factor"},
            "active": {"name": "Physical Activity", "type": "Binary", "unit": "0: Inactive, 1: Active", "impact": "Protective (-0.083)"}
        }
    }


# ============================================================
# PREDICTION ENDPOINT
# ============================================================

@app.post("/predict")
@app.post("/api/predict")
def predict(features: PatientFeatures):
    if model is None:
        raise HTTPException(
            status_code=500,
            detail="cardio_model.pkl is missing or failed to load on backend startup."
        )

    # Determine age_years from either field
    if features.age_years is not None:
        age_years = float(features.age_years)
    elif features.age is not None:
        # If age is given in days (e.g. > 150), convert to years
        age_years = float(features.age / 365.25) if features.age > 150 else float(features.age)
    else:
        raise HTTPException(status_code=400, detail="age_years or age must be provided.")

    # DataFrame with exact 11 feature names and exact order
    feature_dict = {
        "age_years": age_years,
        "gender": features.gender,
        "height": features.height,
        "weight": features.weight,
        "ap_hi": features.ap_hi,
        "ap_lo": features.ap_lo,
        "cholesterol": features.cholesterol,
        "gluc": features.gluc,
        "smoke": features.smoke,
        "alco": features.alco,
        "active": features.active,
    }

    df = pd.DataFrame([feature_dict])

    try:
        prediction_val = int(model.predict(df)[0])
        
        if hasattr(model, "predict_proba"):
            probabilities = model.predict_proba(df)[0]
            prob_no_disease = round(float(probabilities[0]), 4)
            prob_disease = round(float(probabilities[1]), 4)
        else:
            prob_disease = float(prediction_val)
            prob_no_disease = 1.0 - prob_disease

        # BMI Calculation
        height_m = features.height / 100.0
        bmi = round(features.weight / (height_m ** 2), 1) if height_m > 0 else 0
        if bmi < 18.5:
            bmi_cat = "Underweight"
        elif bmi < 25.0:
            bmi_cat = "Normal weight"
        elif bmi < 30.0:
            bmi_cat = "Overweight"
        else:
            bmi_cat = "Obese"

        # Categorize risk level
        if prob_disease >= 0.60:
            risk_level = "High Risk"
            risk_color = "#ef4444"
        elif prob_disease >= 0.35:
            risk_level = "Moderate Risk"
            risk_color = "#f59e0b"
        else:
            risk_level = "Low Risk"
            risk_color = "#10b981"

        # Identify contributing risk factors
        contributing_factors = []
        if features.ap_hi >= 140 or features.ap_lo >= 90:
            contributing_factors.append(f"Elevated Blood Pressure (Stage 2 Hypertension: {features.ap_hi}/{features.ap_lo} mmHg)")
        elif features.ap_hi >= 130 or features.ap_lo >= 80:
            contributing_factors.append(f"Pre-hypertension / Stage 1 ({features.ap_hi}/{features.ap_lo} mmHg)")

        if features.cholesterol == 3:
            contributing_factors.append("Critically High Serum Cholesterol (Well Above Normal)")
        elif features.cholesterol == 2:
            contributing_factors.append("Borderline High Cholesterol (Above Normal)")

        if features.gluc == 3:
            contributing_factors.append("High Blood Glucose / Hyperglycemic Risk (Well Above Normal)")
        elif features.gluc == 2:
            contributing_factors.append("Elevated Blood Glucose (Above Normal)")

        if features.smoke == 1:
            contributing_factors.append("Tobacco Smoking (Increases vascular inflammation)")
        if features.alco == 1:
            contributing_factors.append("Alcohol Consumption")
        if features.active == 0:
            contributing_factors.append("Sedentary Lifestyle (Lack of regular physical exercise)")

        if bmi >= 30:
            contributing_factors.append(f"Clinical Obesity (BMI {bmi} kg/m²)")
        elif bmi >= 25:
            contributing_factors.append(f"Overweight Range (BMI {bmi} kg/m²)")

        if age_years >= 55:
            contributing_factors.append(f"Advanced Age Factor ({int(age_years)} years)")

        # Clinical recommendations
        recommendations = []
        if features.ap_hi >= 130 or features.ap_lo >= 85:
            recommendations.append("Schedule a clinical BP checkup and reduce sodium intake below 2,000 mg/day.")
        if features.cholesterol > 1:
            recommendations.append("Adopt a heart-healthy diet low in saturated fats and request a full lipid panel.")
        if features.smoke == 1:
            recommendations.append("Prioritize smoking cessation to immediately reduce endothelial oxidative stress.")
        if features.active == 0:
            recommendations.append("Aim for at least 150 minutes of moderate aerobic activity weekly.")
        if bmi >= 25:
            recommendations.append("Target a 5-10% gradual weight reduction through balanced caloric deficit.")
        if not recommendations:
            recommendations.append("Maintain routine annual health evaluations, balanced nutrition, and active habits.")

        return {
            "prediction": prediction_val,
            "risk_level": risk_level,
            "risk_color": risk_color,
            "probability_disease": prob_disease,
            "probability_no_disease": prob_no_disease,
            "confidence": prob_disease if prediction_val == 1 else prob_no_disease,
            "bmi": bmi,
            "bmi_category": bmi_cat,
            "contributing_factors": contributing_factors,
            "recommendations": recommendations,
            "features_analyzed": feature_dict
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error executing model prediction: {str(e)}"
        )