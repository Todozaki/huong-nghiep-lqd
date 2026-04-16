import { GoogleGenAI, Type, ThinkingLevel } from "@google/genai";
import { AssessmentData, CareerResult } from "../types";

// In this environment, GEMINI_API_KEY is automatically injected into process.env
const apiKey = process.env.GEMINI_API_KEY || "";

export async function analyzeCareer(data: AssessmentData): Promise<CareerResult> {
  const ai = new GoogleGenAI({ apiKey });

  const systemInstruction = `
Bạn là một Chuyên gia Tư vấn Hướng nghiệp toàn diện và khách quan. Nhiệm vụ của bạn là phân tích hồ sơ học sinh (bao gồm điểm GPA các môn, kết quả test MBTI, mã Holland (RIASEC), sở thích, đam mê, ưu điểm, nhược điểm, kỹ năng mềm & hoạt động ngoại khóa, định hướng vùng miền & tài chính và động lực làm việc) để đưa ra lộ trình nghề nghiệp.

[THIẾT LẬP TRỌNG SỐ ĐÁNH GIÁ - QUAN TRỌNG]
Khi phân tích hồ sơ và đưa ra gợi ý, bạn BẮT BUỘC phải đánh giá mức độ phù hợp dựa trên tỷ lệ trọng số sau:
- 📚 20% - Nền tảng Học thuật (GPA/Điểm môn học): Đánh giá khả năng tiếp thu kiến thức chuyên môn.
- 🧬 25% - Tính cách MBTI: Xác định môi trường làm việc và cách thức tương tác phù hợp.
- 🧭 25% - Trắc nghiệm Holland (RIASEC): Xác định thiên hướng nghề nghiệp và nhóm ngành phù hợp với kỹ năng tự nhiên.
- ❤️ 30% - Đam mê & Sở thích: Đây là yếu tố quan trọng nhất (30%) để đảm bảo sự gắn bó lâu dài, động lực tự thân và niềm vui bền vững trong công việc.

[QUY ĐỊNH VỀ ĐỐI TƯỢNG]
- Nếu học sinh là "Người nước ngoài", hãy lưu ý rằng họ có thể quan tâm đến các chương trình đào tạo bằng tiếng Anh hoặc môi trường quốc tế, nhưng vẫn đưa ra các gợi ý trường học (công lập, tư thục, quốc tế) một cách khách quan dựa trên năng lực và sở thích, không nhất thiết phải ưu tiên trường quốc tế nếu không phù hợp.

[QUY ĐỊNH GỢI Ý TRƯỜNG ĐẠI HỌC - CỰC KỲ QUAN TRỌNG]
Đối với mỗi ngành nghề được chọn, bạn BẮT BUỘC phải gợi ý danh sách các trường Đại học/Cao đẳng đào tạo ngành đó tại Việt Nam, và PHẢI CHIA LÀM 3 NHÓM rõ ràng để học sinh có phương án dự phòng.
ĐẶC BIỆT: Bạn phải ưu tiên gợi ý các trường dựa trên "Định hướng vùng miền" và "Ngân sách chi phí dự kiến" của học sinh:
- Nếu học sinh chọn vùng miền cụ thể (VD: Miền Bắc), hãy ưu tiên các trường ở khu vực đó.
- Nếu học sinh chọn ngân sách cụ thể (VD: Dưới 30 triệu/năm), hãy ưu tiên các trường có mức học phí tương ứng (thường là các trường công lập). (Lưu ý: Bạn PHẢI ghi mức học phí tham khảo vào kết quả trả về).
- Nếu ngân sách là "30 - 60 triệu" hoặc "60 - 120 triệu", hãy cân nhắc các trường công lập tự chủ tài chính hoặc trường tư thục chất lượng cao. (Bạn PHẢI ghi mức học phí tham khảo vào kết quả).
- Nếu ngân sách là "Trên 120 triệu", có thể gợi ý các trường quốc tế hoặc chương trình liên kết quốc tế. (Bạn PHẢI ghi mức học phí tham khảo vào kết quả).
- Nếu không tìm thấy trường phù hợp hoàn hảo với cả 2 tiêu chí, hãy ưu tiên tiêu chí "Vùng miền" trước, sau đó đến "Tài chính", nhưng phải ghi chú rõ.

🌟 Nhóm 1: Trường Top / Mơ ước (Cạnh tranh cao)
Là các trường top đầu ngành, điểm chuẩn rất cao. (VD: Ngoại thương, NEU, Bách Khoa, KHTN...).
Định dạng: Tên trường - Tên ngành cụ thể - Mức học phí tham khảo. (TUYỆT ĐỐI KHÔNG ghi điểm chuẩn).

✅ Nhóm 2: Trường Vừa sức / Phổ biến (Mức độ cạnh tranh trung bình)
Là các trường có chất lượng đào tạo tốt nhưng điểm chuẩn dễ thở hơn, phù hợp với số đông.
Định dạng: Tên trường - Tên ngành cụ thể - Mức học phí tham khảo. (TUYỆT ĐỐI KHÔNG ghi điểm chuẩn).

🛡️ Nhóm 3: Trường Dự phòng / An toàn (Trường phụ)
Là các trường dân lập, trường đại học địa phương, hoặc Cao đẳng có chất lượng đầu ra ổn định, điểm chuẩn thấp hoặc có hình thức xét tuyển học bạ để làm phương án an toàn tuyệt đối.
Định dạng: Tên trường - Tên ngành cụ thể - Mức học phí tham khảo (hoặc ghi "Xét học bạ"). (TUYỆT ĐỐI KHÔNG ghi điểm chuẩn).

[QUY ĐỊNH VỀ LỘ TRÌNH 10 NĂM - CỰC KỲ QUAN TRỌNG]
Bạn BẮT BUỘC phải xây dựng một lộ trình 10 năm RIÊNG BIỆT cho TỪNG ngành nghề trong Top 3. Lộ trình phải cực kỳ chi tiết, thực tế và có tính "sống còn" cho ngành nghề đó. Tuyệt đối không viết chung chung.
Bạn phải chia làm 3 mốc thời gian chính cho mỗi ngành:

1. Mốc 1-2 năm tới (Giai đoạn Bứt tốc & Tích lũy):
- Mục tiêu thực tế: Không ghi "học đại học". Phải ghi các mục tiêu cụ thể như: "Đạt IELTS 6.5, tham gia 2 dự án thực tế, thực tập (Intern) từ năm 2 hoặc năm 3".
- Kỹ năng cứng cần cày: Nêu đích danh công nghệ hoặc công cụ cụ thể (VD: ReactJS, Figma, SQL, AWS Cloud Practitioner).
- Mức thu nhập dự kiến: Ghi rõ (VD: 0 - 5 triệu VNĐ cho trợ cấp thực tập).

2. Mốc 3-5 năm (Giai đoạn Khẳng định & Bật vọt):
- Mục tiêu thực tế: Lên vị trí Junior -> Middle. Yêu cầu phải có sản phẩm thực tế (Portfolio) có người dùng thật hoặc mang lại giá trị cụ thể.
- Chứng chỉ cần thi: Nêu rõ các chứng chỉ quốc tế uy tín trong ngành (VD: AWS Certified Solutions Architect, PMP, CFA Level 1, ACCA).
- Mức thu nhập dự kiến: Ghi rõ (VD: 15 - 30 triệu VNĐ).

3. Mốc 5-10 năm (Giai đoạn Chuyên gia hoặc Rẽ nhánh):
- Phải đưa ra 2 hướng rẽ nhánh thực tế:
  + Hướng 1 (Chuyên gia Kỹ thuật/Chuyên môn): Trở thành Senior / Architect / Specialist (Tập trung sâu vào chuyên môn, lương cao).
  + Hướng 2 (Quản lý/Điều hành): Trở thành Team Lead / Manager / Product Owner (Quản lý con người và quy trình).
- Mức thu nhập dự kiến: Ghi rõ (VD: 40 - 80+ triệu VNĐ).

[QUY ĐỊNH VỀ CẤU TRÚC HIỂN THỊ VÀ LƯƠNG - CỰC KỲ QUAN TRỌNG]
1. Tên ngành (name): Phải là Tên Nhóm Ngành Chung (Ví dụ: Nhóm ngành Công nghệ thông tin, Nhóm ngành Y tế & Chăm sóc sức khỏe).
2. Vị trí cụ thể (specificRoles): Liệt kê rõ các Vị trí nghề nghiệp cụ thể mà học sinh phù hợp trong nhóm ngành đó (Ví dụ: Lập trình viên Web, Bác sĩ Đa khoa). Phân biệt rõ lộ trình của các nghề trong cùng một nhóm.
3. Mức lương (salaryRange): BẮT BUỘC hiển thị theo định dạng: "Mức lương thực tế: [Thấp nhất] - [Cao nhất] VNĐ/tháng".
   - Mức thấp nhất: Là mức lương khởi điểm thực tế cho sinh viên mới ra trường tại thị trường Việt Nam hiện nay.
   - Mức cao nhất: Là mức lương kỳ vọng sau 3-5 năm kinh nghiệm hoặc làm việc tại các môi trường cao cấp (tập đoàn lớn, bệnh viện tư nhân...).
   - Ví dụ: "Mức lương thực tế: 8.000.000 - 35.000.000 VNĐ/tháng".
4. Ngôn ngữ chuyên môn: Tránh dùng các từ ngữ quá bay bổng như "động lực làm giàu", hãy dùng các từ chuyên môn hướng nghiệp chuẩn xác hơn.

[QUY ĐỊNH NGHIÊM NGẶT VỀ ĐỘ DÀI]
Giao diện hiển thị có giới hạn không gian, do đó bạn BẮT BUỘC phải viết cực kỳ ngắn gọn và súc tích.
- Đối với phần mô tả ngành nghề: Tuyệt đối không dài dòng. Giới hạn tối đa 1 đến 2 câu ngắn (dưới 25 từ).
- Đi thẳng vào trọng tâm, sử dụng các động từ mạnh.

Quy tắc bắt buộc khác:
1. Tránh thiên kiến về ngành Công nghệ: Chỉ gợi ý CNTT nếu thực sự phù hợp.
2. Tiêu chí Gợi ý (Lý do phù hợp - Why you?): Giải thích rõ tại sao ngành này phù hợp dựa trên 4 yếu tố (GPA, MBTI, Holland, Đam mê). Hãy nêu cụ thể các điểm mạnh của học sinh (VD: "Phù hợp vì bạn có điểm Toán cao (9.7), tính cách INTJ thích tư duy logic...").
3. Tổ hợp môn xét tuyển: Với mỗi ngành nghề, hãy chỉ ra các tổ hợp môn xét tuyển phổ biến tại Việt Nam (VD: A00, A01, D01, B00...).
4. Phân tích SWOT: Kèm theo phân tích SWOT cho từng ngành.
5. Job Wiki: Cung cấp các công việc hàng ngày và thuật ngữ chuyên ngành.
6. Nhận xét tổng quát (overallSummary): Đoạn nhận xét sâu sắc, khích lệ về giá trị bản thân học sinh.
7. Cấu trúc đầu ra đa dạng: Cung cấp BẮT BUỘC 3 lựa chọn nghề nghiệp thuộc 3 lĩnh vực hoàn toàn khác nhau để học sinh có cái nhìn đa chiều.
`;

  const prompt = `
Dưới đây là hồ sơ học sinh:
- Đối tượng: ${data.origin === 'international' ? 'Người nước ngoài (quan tâm đến học tập/làm việc tại Việt Nam hoặc quốc tế)' : 'Người Việt Nam'}
${data.origin === 'international' ? `- Chứng chỉ quốc tế & Thành tích: ${data.internationalCertificates}` : `- GPA năm học gần nhất: ${data.gpa}\n- Điểm các môn (Thang điểm 10, -1 là không học): ${JSON.stringify(data.subjects)}`}
- MBTI: ${data.mbti}
- Mã Holland (3 nhóm cao nhất): ${data.holland.join(", ")}
- Sở thích: ${data.interests.join(", ")}
- Đam mê: ${data.passions.join(", ")}
- Ưu điểm: ${data.strengths.join(", ")}
- Nhược điểm: ${data.weaknesses.join(", ")}
- Kỹ năng mềm & Hoạt động ngoại khóa: ${data.softSkills.join(", ")}
- Khu vực mong muốn: ${data.preferredRegion.join(", ") || "Không ưu tiên"}
- Loại hình trường/Tài chính: ${data.preferredFinancial.join(", ") || "Không ưu tiên"}
- Động lực làm việc: ${data.coreMotivations.join(", ")}

Hãy phân tích và trả về kết quả định dạng JSON theo đúng schema yêu cầu.
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.2,
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            topCareers: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  specificRoles: { type: Type.ARRAY, items: { type: Type.STRING } },
                  matchPercentage: { type: Type.NUMBER },
                  description: { type: Type.STRING },
                  reason: { type: Type.STRING },
                  admissionSubjects: { type: Type.ARRAY, items: { type: Type.STRING } },
                  startingSalary: { type: Type.STRING },
                  salaryRange: { type: Type.STRING },
                  demandForecast: { type: Type.STRING },
                  marketInsight: { type: Type.STRING },
                  jobWiki: {
                    type: Type.OBJECT,
                    properties: {
                      dailyTasks: { type: Type.ARRAY, items: { type: Type.STRING } },
                      terms: { type: Type.ARRAY, items: { type: Type.STRING } }
                    }
                  },
                  universities: {
                    type: Type.OBJECT,
                    properties: {
                      top: { type: Type.ARRAY, items: { type: Type.STRING } },
                      medium: { type: Type.ARRAY, items: { type: Type.STRING } },
                      safe: { type: Type.ARRAY, items: { type: Type.STRING } }
                    },
                    required: ["top", "medium", "safe"]
                  },
                  roadmap: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        period: { type: Type.STRING },
                        title: { type: Type.STRING },
                        goals: { type: Type.ARRAY, items: { type: Type.STRING } },
                        hardSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
                        salary: { type: Type.STRING },
                        milestone: { type: Type.STRING },
                        certifications: { type: Type.ARRAY, items: { type: Type.STRING } },
                        branchingPaths: {
                          type: Type.OBJECT,
                          properties: {
                            technical: {
                              type: Type.OBJECT,
                              properties: {
                                title: { type: Type.STRING },
                                goals: { type: Type.STRING },
                                salary: { type: Type.STRING }
                              }
                            },
                            management: {
                              type: Type.OBJECT,
                              properties: {
                                title: { type: Type.STRING },
                                goals: { type: Type.STRING },
                                salary: { type: Type.STRING }
                              }
                            }
                          }
                        }
                      },
                      required: ["period", "title", "goals", "hardSkills", "salary", "milestone"]
                    }
                  }
                },
                required: ["name", "matchPercentage", "description", "reason", "admissionSubjects", "startingSalary", "demandForecast", "marketInsight", "jobWiki", "universities", "roadmap"]
              }
            },
            contingencyPlans: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  type: { type: Type.STRING, enum: ["niche", "vocational"] },
                  description: { type: Type.STRING }
                },
                required: ["name", "type", "description"]
              }
            },
            skillsToDevelop: { type: Type.ARRAY, items: { type: Type.STRING } },
            overallSummary: { type: Type.STRING }
          },
          required: ["topCareers", "contingencyPlans", "skillsToDevelop", "overallSummary"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
}

export function createCounselorChat(data: AssessmentData, result: CareerResult) {
  const ai = new GoogleGenAI({ apiKey });
  
  const systemInstruction = `Bạn là chuyên gia tư vấn hướng nghiệp. Dưới đây là hồ sơ của học sinh và kết quả bạn đã tư vấn. 
Hãy trả lời các câu hỏi tiếp theo của học sinh một cách ngắn gọn, súc tích (dưới 50 từ mỗi câu trả lời nếu có thể), tập trung vào việc làm rõ lộ trình, ngành học, hoặc trường đại học.
Tuyệt đối giữ thái độ chuyên nghiệp, khách quan và khích lệ.

Hồ sơ học sinh: ${JSON.stringify(data)}
Kết quả tư vấn: ${JSON.stringify(result)}`;

  return ai.chats.create({
    model: "gemini-3-flash-preview",
    config: {
      systemInstruction,
      temperature: 0.2,
      thinkingConfig: { thinkingLevel: ThinkingLevel.LOW }
    }
  });
}
