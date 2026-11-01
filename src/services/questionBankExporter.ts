import * as XLSX from 'xlsx';
import { BankQuestion, ExportConfig } from '../types/questionBank';

const TYPE_NAMES: Record<string, string> = {
  single_choice: 'Trắc nghiệm 1 đáp án',
  multiple_choice: 'Trắc nghiệm nhiều đáp án',
  true_false_group: 'Đúng/Sai theo từng ý',
  matching: 'Ghép đôi',
  ordering: 'Sắp xếp thứ tự',
  fill_blank: 'Điền khuyết',
  short_answer: 'Trả lời ngắn',
  essay: 'Tự luận',
  passage_group: 'Đoạn văn / Tình huống',
};

const DIFFICULTY_NAMES: Record<string, string> = {
  knowledge: 'Nhận biết',
  comprehension: 'Thông hiểu',
  application: 'Vận dụng',
  high_application: 'Vận dụng cao',
};

/**
 * Format answer text for export based on question type
 */
function formatAnswerString(q: BankQuestion): string {
  switch (q.type) {
    case 'single_choice': {
      if (q.options && typeof q.correctAnswer === 'number' && q.options[q.correctAnswer]) {
        const letter = String.fromCharCode(65 + q.correctAnswer);
        return `${letter}. ${q.options[q.correctAnswer]}`;
      }
      return 'N/A';
    }
    case 'multiple_choice': {
      if (q.options && Array.isArray(q.correctAnswers)) {
        return q.correctAnswers
          .map((idx) => `${String.fromCharCode(65 + idx)}. ${q.options?.[idx]}`)
          .join('; ');
      }
      return 'N/A';
    }
    case 'true_false_group': {
      return (q.statements || [])
        .map((st, i) => `${i + 1}) ${st.text} -> [${st.isCorrect ? 'ĐÚNG' : 'SAI'}]`)
        .join('\n');
    }
    case 'matching': {
      return (q.matchingPairs || [])
        .map((p, i) => `Cặp ${i + 1}: "${p.left}"  <--->  "${p.right}"`)
        .join('\n');
    }
    case 'ordering': {
      return (q.orderingItems || [])
        .slice()
        .sort((a, b) => a.correctIndex - b.correctIndex)
        .map((item) => `Bước ${item.correctIndex}: ${item.text}`)
        .join(' -> ');
    }
    case 'fill_blank': {
      return (q.blanks || [])
        .map((b) => `[${b.id}]: ${b.acceptedAnswers.join(' / ')}`)
        .join('; ');
    }
    case 'short_answer': {
      return q.sampleAnswer || (q.acceptedVariations ? q.acceptedVariations.join(' / ') : 'N/A');
    }
    case 'essay': {
      return q.suggestedAnswer || q.rubric || 'N/A';
    }
    case 'passage_group': {
      return (q.subQuestions || [])
        .map((sub, i) => {
          let ans = 'N/A';
          if (typeof sub.correctAnswer === 'number' && sub.options) {
            ans = `${String.fromCharCode(65 + sub.correctAnswer)}. ${sub.options[sub.correctAnswer]}`;
          } else if (sub.correctAnswer !== undefined) {
            ans = String(sub.correctAnswer);
          }
          return `Câu ${i + 1}: ${ans}`;
        })
        .join('\n');
    }
    default:
      return 'N/A';
  }
}

/**
 * 1. Export to Excel (.xlsx) using SheetJS
 */
export function exportToExcel(questions: BankQuestion[], config: ExportConfig): void {
  const rows = questions.map((q, idx) => {
    const row: Record<string, any> = {
      STT: idx + 1,
      'Mã câu hỏi': q.code,
      'Dạng câu hỏi': TYPE_NAMES[q.type] || q.type,
      'Khối lớp': q.grade,
      'Môn học': q.subject,
      'Chương / Bài': q.chapter || '',
      'Chủ đề': q.topic,
      'Mức độ': DIFFICULTY_NAMES[q.difficulty] || q.difficulty,
      'Điểm số': q.points,
      'Nội dung đề bài': q.content,
    };

    // Add options
    if (q.options && q.options.length > 0) {
      q.options.forEach((opt, oIdx) => {
        row[`Phương án ${String.fromCharCode(65 + oIdx)}`] = opt;
      });
    }

    if (config.includeAnswers) {
      row['Đáp án chuẩn'] = formatAnswerString(q);
    }

    if (config.includeExplanations) {
      row['Lời giải chi tiết'] = q.explanation || '';
    }

    if (config.includeMetadata) {
      row['Nguồn tạo'] = q.source;
      row['Tác giả'] = q.author;
      row['Trạng thái'] = q.status;
      row['Thẻ (Tags)'] = q.tags.join(', ');
      row['Ngày cập nhật'] = q.updatedAt.slice(0, 10);
    }

    return row;
  });

  const worksheet = XLSX.utils.json_to_sheet(rows);

  // Auto-fit column widths
  const colWidths = Object.keys(rows[0] || {}).map((key) => ({
    wch: Math.max(key.length, 14),
  }));
  worksheet['!cols'] = colWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Ngân hàng câu hỏi');

  const fileName = `${config.examTitle || 'NganHangCauHoi'}_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(workbook, fileName);
}

/**
 * 2. Export to Word (.doc) using clean HTML formatted document
 */
export function exportToWord(questions: BankQuestion[], config: ExportConfig): void {
  const dateStr = new Date().toLocaleDateString('vi-VN');

  const questionItemsHtml = questions
    .map((q, idx) => {
      let bodyHtml = '';

      // Type-specific content rendering
      if (q.type === 'single_choice' || q.type === 'multiple_choice') {
        if (q.options && q.options.length > 0) {
          bodyHtml += `
            <div style="margin-top: 8px; margin-left: 18px;">
              ${q.options
                .map(
                  (opt, oIdx) =>
                    `<div style="margin-bottom: 4px;"><b>${String.fromCharCode(65 + oIdx)}.</b> ${opt}</div>`
                )
                .join('')}
            </div>
          `;
        }
      } else if (q.type === 'true_false_group') {
        bodyHtml += `
          <table border="1" cellpadding="6" cellspacing="0" style="width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 13px;">
            <tr style="background-color: #f1f5f9;">
              <th style="width: 40px; text-align: center;">Ý</th>
              <th style="text-align: left;">Mệnh đề</th>
              <th style="width: 80px; text-align: center;">Đúng</th>
              <th style="width: 80px; text-align: center;">Sai</th>
            </tr>
            ${(q.statements || [])
              .map(
                (st, sIdx) => `
              <tr>
                <td style="text-align: center; font-weight: bold;">${String.fromCharCode(97 + sIdx)})</td>
                <td>${st.text}</td>
                <td style="text-align: center;">[  ]</td>
                <td style="text-align: center;">[  ]</td>
              </tr>
            `
              )
              .join('')}
          </table>
        `;
      } else if (q.type === 'matching') {
        bodyHtml += `
          <table border="1" cellpadding="6" cellspacing="0" style="width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 13px;">
            <tr style="background-color: #f1f5f9;">
              <th style="width: 50%;">Cột A</th>
              <th style="width: 50%;">Cột B</th>
            </tr>
            ${(q.matchingPairs || [])
              .map(
                (p, pIdx) => `
              <tr>
                <td><b>${pIdx + 1}.</b> ${p.left}</td>
                <td><b>${String.fromCharCode(65 + pIdx)}.</b> ${p.right}</td>
              </tr>
            `
              )
              .join('')}
          </table>
          <p style="margin-top: 6px; font-style: italic; font-size: 12px; color: #475569;">
            Ghép nối: 1 - ...; 2 - ...; 3 - ...; 4 - ...
          </p>
        `;
      } else if (q.type === 'fill_blank') {
        bodyHtml += `
          <div style="background-color: #f8fafc; padding: 10px; border-left: 3px solid #0284c7; margin-top: 8px; font-size: 13px;">
            ${q.templateText || q.content}
          </div>
        `;
      } else if (q.type === 'passage_group') {
        bodyHtml += `
          <div style="background-color: #f8fafc; padding: 12px; border-left: 4px solid #7c3aed; margin-top: 8px; font-style: italic; font-size: 13px; line-height: 1.6;">
            ${(q.passage || '').replace(/\n/g, '<br/>')}
          </div>
          <div style="margin-top: 10px; margin-left: 12px;">
            ${(q.subQuestions || [])
              .map(
                (sub, sIdx) => `
              <div style="margin-bottom: 10px;">
                <p><b>Câu ${idx + 1}.${sIdx + 1}:</b> ${sub.content} <i>(${sub.points} điểm)</i></p>
                ${
                  sub.options
                    ? `<div style="margin-left: 16px;">
                        ${sub.options
                          .map(
                            (o, oIdx) =>
                              `<div><b>${String.fromCharCode(65 + oIdx)}.</b> ${o}</div>`
                          )
                          .join('')}
                      </div>`
                    : ''
                }
              </div>
            `
              )
              .join('')}
          </div>
        `;
      } else if (q.type === 'essay') {
        bodyHtml += `
          <div style="border: 1px dashed #94a3b8; height: 120px; margin-top: 10px; padding: 8px; color: #94a3b8; font-size: 12px;">
            (Phần bài làm của học sinh...)
          </div>
        `;
      }

      let metaBadges = '';
      if (config.includeMetadata) {
        metaBadges = `
          <span style="display: inline-block; background-color: #e2e8f0; font-size: 11px; padding: 2px 6px; border-radius: 4px; margin-right: 6px;">
            ${TYPE_NAMES[q.type] || q.type}
          </span>
          <span style="display: inline-block; background-color: #e0f2fe; color: #0369a1; font-size: 11px; padding: 2px 6px; border-radius: 4px; margin-right: 6px;">
            ${DIFFICULTY_NAMES[q.difficulty] || q.difficulty}
          </span>
          <span style="display: inline-block; font-size: 11px; color: #64748b;">
            Mã: ${q.code} | ${q.points} điểm
          </span>
        `;
      }

      let answerSolutionHtml = '';
      if (config.includeAnswers) {
        answerSolutionHtml += `
          <div style="margin-top: 8px; padding: 6px 10px; background-color: #ecfdf5; border-left: 3px solid #10b981; font-size: 12px;">
            <b style="color: #065f46;">Đáp án:</b> ${formatAnswerString(q).replace(/\n/g, '<br/>')}
          </div>
        `;
      }

      if (config.includeExplanations && q.explanation) {
        answerSolutionHtml += `
          <div style="margin-top: 4px; padding: 6px 10px; background-color: #eff6ff; border-left: 3px solid #3b82f6; font-size: 12px;">
            <b style="color: #1e40af;">Lời giải chi tiết:</b> ${q.explanation.replace(/\n/g, '<br/>')}
          </div>
        `;
      }

      return `
        <div style="margin-bottom: 22px; page-break-inside: avoid;">
          <div style="margin-bottom: 4px;">
            <b>Câu ${idx + 1}:</b> ${q.content}
            <div style="margin-top: 4px;">${metaBadges}</div>
          </div>
          ${bodyHtml}
          ${answerSolutionHtml}
        </div>
      `;
    })
    .join('');

  const htmlContent = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset="utf-8">
        <title>${config.examTitle || 'Ngân hàng câu hỏi'}</title>
        <style>
          body { font-family: 'Times New Roman', 'Arial', sans-serif; font-size: 14px; line-height: 1.5; color: #0f172a; margin: 30px; }
          .header-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          .header-table td { vertical-align: top; }
          .exam-title { text-align: center; font-size: 18px; font-weight: bold; text-transform: uppercase; margin-bottom: 6px; }
          .exam-subtitle { text-align: center; font-size: 13px; font-style: italic; margin-bottom: 20px; }
          .watermark { text-align: right; font-size: 11px; color: #94a3b8; }
        </style>
      </head>
      <body>
        <table class="header-table">
          <tr>
            <td style="width: 50%; text-align: center;">
              <b>${config.schoolName || 'TRƯỜNG THPT CHUYÊN'}</b><br/>
              <b>TỔ BỘ MÔN CHUYÊN MÔN</b>
            </td>
            <td style="width: 50%; text-align: center;">
              <b>HỆ THỐNG QUẢN LÝ LỚP HỌC THÔNG MINH</b><br/>
              <i>Ngày xuất: ${dateStr}</i>
            </td>
          </tr>
        </table>

        <div class="exam-title">${config.examTitle || 'NGÂN HÀNG CÂU HỎI TRỌNG TÂM'}</div>
        <div class="exam-subtitle">
          Thời gian làm bài: ${config.durationMinutes || 45} phút | Số lượng câu hỏi: ${questions.length} câu
        </div>

        <hr style="border: 0; border-top: 1px solid #cbd5e1; margin-bottom: 24px;" />

        <div class="questions-container">
          ${questionItemsHtml}
        </div>

        <div style="text-align: center; margin-top: 30px; font-style: italic; font-size: 12px; color: #64748b;">
          ---------- HẾT ----------
        </div>
      </body>
    </html>
  `;

  const blob = new Blob(['\ufeff', htmlContent], {
    type: 'application/msword;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${config.examTitle || 'NganHangCauHoi'}_${new Date().toISOString().slice(0, 10)}.doc`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * 3. Print / PDF generation
 */
export function printExamOrQuestionList(questions: BankQuestion[], config: ExportConfig): void {
  // Use a temporary print window
  const printWindow = window.open('', '_blank', 'width=900,height=800');
  if (!printWindow) {
    alert('Vui lòng cho phép mở popup để xem bản in / PDF');
    return;
  }

  const dateStr = new Date().toLocaleDateString('vi-VN');

  const questionItemsHtml = questions
    .map((q, idx) => {
      let optionsHtml = '';
      if ((q.type === 'single_choice' || q.type === 'multiple_choice') && q.options) {
        optionsHtml = `
          <div class="options-grid">
            ${q.options
              .map(
                (opt, oIdx) =>
                  `<div><b>${String.fromCharCode(65 + oIdx)}.</b> ${opt}</div>`
              )
              .join('')}
          </div>
        `;
      } else if (q.type === 'true_false_group' && q.statements) {
        optionsHtml = `
          <table class="tf-table">
            <thead>
              <tr><th>Ý</th><th>Mệnh đề</th><th>Đúng</th><th>Sai</th></tr>
            </thead>
            <tbody>
              ${q.statements
                .map(
                  (st, sIdx) =>
                    `<tr>
                      <td style="text-align:center;">${String.fromCharCode(97 + sIdx)})</td>
                      <td>${st.text}</td>
                      <td style="text-align:center;">O</td>
                      <td style="text-align:center;">O</td>
                    </tr>`
                )
                .join('')}
            </tbody>
          </table>
        `;
      } else if (q.type === 'matching' && q.matchingPairs) {
        optionsHtml = `
          <table class="match-table">
            <thead><tr><th>Cột A</th><th>Cột B</th></tr></thead>
            <tbody>
              ${q.matchingPairs
                .map(
                  (p, pIdx) =>
                    `<tr><td><b>${pIdx + 1}.</b> ${p.left}</td><td><b>${String.fromCharCode(65 + pIdx)}.</b> ${p.right}</td></tr>`
                )
                .join('')}
            </tbody>
          </table>
        `;
      } else if (q.type === 'passage_group') {
        optionsHtml = `
          <div class="passage-box">${q.passage || ''}</div>
          <div class="sub-questions">
            ${(q.subQuestions || [])
              .map(
                (sub, sIdx) => `
              <div class="sub-q">
                <p><b>Câu ${idx + 1}.${sIdx + 1}:</b> ${sub.content}</p>
                ${
                  sub.options
                    ? `<div class="options-grid">
                        ${sub.options.map((o, oIdx) => `<div><b>${String.fromCharCode(65 + oIdx)}.</b> ${o}</div>`).join('')}
                      </div>`
                    : ''
                }
              </div>
            `
              )
              .join('')}
          </div>
        `;
      }

      let answerHtml = '';
      if (config.includeAnswers) {
        answerHtml = `
          <div class="answer-box">
            <b>Đáp án:</b> ${formatAnswerString(q)}
          </div>
        `;
      }
      if (config.includeExplanations && q.explanation) {
        answerHtml += `
          <div class="solution-box">
            <b>Lời giải:</b> ${q.explanation}
          </div>
        `;
      }

      return `
        <div class="question-card">
          <div class="q-header">
            <b>Câu ${idx + 1}:</b> ${q.content}
            <span class="q-points">(${q.points} điểm)</span>
          </div>
          ${optionsHtml}
          ${answerHtml}
        </div>
      `;
    })
    .join('');

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${config.examTitle || 'Ngân hàng câu hỏi'}</title>
        <style>
          @page { size: A4; margin: 15mm; }
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; font-size: 13px; line-height: 1.5; color: #1e293b; padding: 20px; }
          .header-table { width: 100%; margin-bottom: 20px; }
          .header-table td { vertical-align: top; }
          .title { text-align: center; font-size: 18px; font-weight: bold; text-transform: uppercase; margin-bottom: 5px; }
          .subtitle { text-align: center; font-size: 12px; color: #64748b; margin-bottom: 25px; }
          .question-card { margin-bottom: 18px; page-break-inside: avoid; }
          .q-header { font-size: 13.5px; margin-bottom: 6px; }
          .q-points { font-size: 11px; color: #64748b; margin-left: 6px; }
          .options-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px 16px; margin-left: 15px; margin-top: 6px; }
          .tf-table, .match-table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 12px; }
          .tf-table th, .tf-table td, .match-table th, .match-table td { border: 1px solid #cbd5e1; padding: 5px 8px; }
          .tf-table th, .match-table th { background: #f8fafc; }
          .passage-box { background: #f8fafc; border-left: 3px solid #7c3aed; padding: 10px; margin-top: 6px; font-style: italic; }
          .answer-box { background: #ecfdf5; border-left: 3px solid #10b981; padding: 5px 8px; margin-top: 6px; font-size: 12px; }
          .solution-box { background: #eff6ff; border-left: 3px solid #3b82f6; padding: 5px 8px; margin-top: 4px; font-size: 12px; }
          @media print {
            body { padding: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="no-print" style="margin-bottom: 20px; background: #e0f2fe; padding: 10px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">
          <span>Xem trước bản in (Nhấn Ctrl+P hoặc nút bên phải để In / Lưu thành PDF)</span>
          <button onclick="window.print()" style="padding: 6px 16px; background: #0284c7; color: white; border: none; border-radius: 6px; font-weight: bold; cursor: pointer;">In ngay / Lưu PDF</button>
        </div>

        <table class="header-table">
          <tr>
            <td style="width: 50%; text-align: center;">
              <b>${config.schoolName || 'TRƯỜNG THPT CHUYÊN'}</b><br/>
              <b>HỆ THỐNG QUẢN LÝ LỚP HỌC THÔNG MINH</b>
            </td>
            <td style="width: 50%; text-align: center;">
              <b>ĐỀ KIỂM TRA / TÀI LIỆU ÔN TẬP</b><br/>
              <i>Ngày: ${dateStr}</i>
            </td>
          </tr>
        </table>

        <div class="title">${config.examTitle || 'NGÂN HÀNG CÂU HỎI TRỌNG TÂM'}</div>
        <div class="subtitle">
          Thời gian: ${config.durationMinutes || 45} phút | Tổng số câu: ${questions.length} câu
        </div>

        <div class="questions">
          ${questionItemsHtml}
        </div>

        <div style="text-align: center; margin-top: 30px; font-style: italic; font-size: 12px; color: #64748b;">
          ---------- HẾT ----------
        </div>
      </body>
    </html>
  `);

  printWindow.document.close();
}
