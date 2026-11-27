import React from 'react';
import { Leaf, FlaskConical, Stethoscope, Droplets, CheckCircle2, ShieldAlert, Sprout } from 'lucide-react';
import { motion } from 'framer-motion';

const TreatmentInfo = ({ data }) => {
  if (!data) return null;

  const isHealthy = data.healthStatus === 'healthy' || data.isHealthy;

  // Extract text safely bridging old structure or Gemini format
  const getOrganic = () => {
    if (data.organicAlternative) return data.organicAlternative;
    const org = data.treatments?.find(t => t.type?.toLowerCase() === 'organic');
    return org ? `${org.action}:\n${org.detail}\n(Apply: ${org.timing})` : null;
  };

  const getChemical = () => {
    const chem = data.treatments?.find(t => t.type?.toLowerCase() === 'chemical');
    if (chem) return `${chem.action}:\n${chem.detail}\n(Apply: ${chem.timing})`;
    if (data.recommendation?.chemical) return data.recommendation.chemical;
    return null;
  };

  const organicText = getOrganic() || "Desi cow dung compost and neem spray is recommended for prevention.";
  const chemicalText = getChemical() || "Consult nearest agricultural center for exact chemical dosage.";
  const guidanceText = data.additionalNotes || data.preventionTips?.[0] || 'Maintain good soil health and water regularly.';

  return (
    <div className="mt-8 space-y-8 font-nunito">
      
      {/* 1. Main Diagnostic Banner (Soft and Trustworthy) */}
      {!isHealthy && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-[#FFF8EE] to-[#FFF0DD] border border-[#F2D7B4] rounded-[24px] p-6 md:p-8 flex flex-col items-center text-center shadow-[0_4px_20px_rgba(217,56,30,0.05)]"
        >
          <div className="w-20 h-20 rounded-full bg-white shadow-md flex items-center justify-center mb-6 relative">
            <div className="absolute inset-0 rounded-full border-[6px] border-[#FFEBEB]"></div>
            <Stethoscope className="w-10 h-10 text-[#D9381E] relative z-10" />
          </div>

          <div className="w-full flex flex-col md:flex-row justify-center gap-4 md:gap-12 divide-y md:divide-y-0 md:divide-x divide-[#F2D7B4]/50">
            <div className="flex flex-col items-center md:pr-8 py-2">
              <span className="text-[14px] uppercase tracking-widest font-bold text-[#D9381E]/60 mb-2 flex items-center gap-2">
                Crop <Sprout className="w-4 h-4"/>
              </span>
              <span className="font-playfair font-extrabold text-[28px] md:text-[32px] text-[#4A5D23] leading-tight">
                {data.cropName || 'Unknown Crop'}
              </span>
            </div>

            <div className="flex flex-col items-center md:pl-8 py-2">
              <span className="text-[14px] uppercase tracking-widest font-bold text-[#D9381E]/60 mb-2 flex items-center gap-2">
                Disease <ShieldAlert className="w-4 h-4"/>
              </span>
              <span className="font-playfair font-extrabold text-[28px] md:text-[32px] text-[#D9381E] leading-tight max-w-[300px]">
                {data.diseaseName || 'an Unknown Disease'}
              </span>
            </div>
          </div>
        </motion.div>
      )}

      {/* 2. Farmer Guidance Panel (Human-made touch) */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-[#F2F7EF] rounded-[24px] p-6 md:p-8 shadow-sm border border-[#E0EDD5] relative overflow-hidden"
      >
        <div className="absolute -right-4 -top-4 opacity-10">
           <Leaf className="w-32 h-32 text-[#2B3B18]" />
        </div>
        <div className="flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-6 relative z-10">
          <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center flex-shrink-0 shadow-sm border border-[#D5E8D4]">
            <CheckCircle2 className="w-8 h-8 text-[#4A5D23]" />
          </div>
          <div className="text-center md:text-left">
            <h3 className="text-[18px] uppercase tracking-wider font-extrabold text-[#2B3B18] mb-2 font-nunito flex gap-2 justify-center md:justify-start">
              <span>Expert Advice</span>
            </h3>
            <p className="text-[#3A4D1A] font-semibold text-[18px] md:text-[20px] leading-relaxed italic">
              "{guidanceText}"
            </p>
          </div>
        </div>
      </motion.div>

      {/* 3. Symptom Log */}
      {!isHealthy && (
        <motion.div 
           initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
           className="bg-[#FCFCFC] rounded-[20px] px-6 py-5 border-[1.5px] border-[#EFEFEF] shadow-sm flex flex-col gap-3"
        >
          <div className="flex items-center gap-2">
             <span className="w-2 h-2 rounded-full bg-[#9E9E9E]"></span>
             <h4 className="font-bold uppercase tracking-widest text-[13px] text-[#757575] font-nunito">Detected Symptoms</h4>
          </div>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
            {(data.symptoms || []).length > 0 ? (
               data.symptoms.map((symptom, i) => (
                 <li key={i} className="flex items-start gap-2 text-[15px] font-bold text-[#424242]">
                   <span className="text-[#D9381E] mt-0.5 opacity-50">✓</span> <span>{symptom}</span>
                 </li>
               ))
            ) : (
               <li className="text-[#757575] font-semibold italic">General crop anomalies detected.</li>
            )}
          </ul>
        </motion.div>
      )}

    </div>
  );
};

export default TreatmentInfo;
