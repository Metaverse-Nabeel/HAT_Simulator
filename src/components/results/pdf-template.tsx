import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

// Register standard fonts
Font.register({
    family: 'Open Sans',
    src: 'https://fonts.gstatic.com/s/opensans/v18/mem8YaGs126MiZpBA-UFVZ0e.ttf',
});

const styles = StyleSheet.create({
    page: { padding: 40, fontFamily: 'Open Sans', fontSize: 11, color: '#1e293b' },
    header: { marginBottom: 30, borderBottom: '2px solid #0f172a', paddingBottom: 10 },
    title: { fontSize: 24, fontWeight: 'bold', color: '#0f172a' },
    subtitle: { fontSize: 12, color: '#64748b', marginTop: 5 },
    section: { marginVertical: 15 },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', borderBottom: '1px solid #cbd5e1', paddingBottom: 5, marginBottom: 10, color: '#334155' },
    row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
    label: { fontWeight: 'bold', width: 120 },
    value: { flex: 1 },
    scoreBox: { backgroundColor: '#f8fafc', padding: 15, borderRadius: 5, marginTop: 15, flexDirection: 'row', justifyContent: 'space-between', border: '1px solid #e2e8f0' },
    scoreMain: { fontSize: 20, fontWeight: 'bold', color: '#14b8a6' },

    qContainer: { marginBottom: 15, paddingBottom: 15, borderBottom: '1px solid #f1f5f9' },
    qHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
    qNum: { width: 25, fontWeight: 'bold', color: '#0f172a' },
    qText: { flex: 1, fontWeight: 'bold' },
    qStatus: { width: 60, textAlign: 'right', fontSize: 10, fontWeight: 'bold' },

    optContainer: { flexDirection: 'row', marginLeft: 25, marginTop: 3 },
    optNum: { width: 20, color: '#64748b' },
    optText: { flex: 1 },
    correctOpt: { color: '#16a34a', fontWeight: 'bold' },
    wrongOpt: { color: '#ef4444', fontWeight: 'bold' },

    explanation: { backgroundColor: '#f0fdf4', padding: 10, marginLeft: 25, marginTop: 8, borderRadius: 4, color: '#0f172a' },
    expTitle: { fontSize: 10, fontWeight: 'bold', color: '#16a34a', marginBottom: 4 }
});

export function PdfTemplate({ attempt, user }: { attempt: any, user: any }) {
    const rs = attempt.resultsData || [];
    const pct = attempt.maxScore > 0 ? Math.round((attempt.score / attempt.maxScore) * 100) : 0;

    const m = Math.floor(attempt.timeSpent / 60);
    const s = attempt.timeSpent % 60;
    const timeStr = `${m}m ${s}s`;

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>HAT Simulator Report</Text>
                    <Text style={styles.subtitle}>Candidate: {user.name || user.email}</Text>
                    <Text style={styles.subtitle}>Date: {new Date(attempt.createdAt).toLocaleDateString()}</Text>
                </View>

                {/* Summary Details */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Exam Summary</Text>
                    <View style={styles.row}><Text style={styles.label}>Category:</Text><Text style={styles.value}>{attempt.category}</Text></View>
                    <View style={styles.row}><Text style={styles.label}>Mode:</Text><Text style={styles.value}>{attempt.mode}</Text></View>
                    <View style={styles.row}><Text style={styles.label}>Difficulty:</Text><Text style={styles.value}>{attempt.difficulty}</Text></View>
                    <View style={styles.row}><Text style={styles.label}>Time Spent:</Text><Text style={styles.value}>{timeStr}</Text></View>

                    <View style={styles.scoreBox}>
                        <View>
                            <Text style={{ fontSize: 12, color: '#64748b' }}>Total Score</Text>
                            <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{attempt.score} / {attempt.maxScore}</Text>
                        </View>
                        <View>
                            <Text style={{ fontSize: 12, color: '#64748b', textAlign: 'right' }}>Percentage</Text>
                            <Text style={{ fontSize: 16, fontWeight: 'bold', textAlign: 'right' }}>{pct}%</Text>
                        </View>
                        <View>
                            <Text style={{ fontSize: 12, color: '#64748b', textAlign: 'right' }}>XP Earned</Text>
                            <Text style={styles.scoreMain}>+{attempt.xpEarned || 0}</Text>
                        </View>
                    </View>
                </View>

                {/* Question Review */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Detailed Review</Text>
                    {rs.map((q: any, i: number) => {
                        const isCorrect = q.userAnswer === q.correctAnswer;
                        const isSkipped = q.userAnswer === null;

                        return (
                            <View key={i} style={styles.qContainer} wrap={false}>
                                <View style={styles.qHeader}>
                                    <Text style={styles.qNum}>{i + 1}.</Text>
                                    <Text style={styles.qText}>{q.questionText}</Text>
                                    <Text style={[styles.qStatus, { color: isCorrect ? '#16a34a' : isSkipped ? '#64748b' : '#ef4444' }]}>
                                        {isSkipped ? 'SKIPPED' : isCorrect ? 'CORRECT' : 'WRONG'}
                                    </Text>
                                </View>

                                {q.options.map((opt: string, oi: number) => {
                                    const isCorrectOpt = (oi === q.correctAnswer);
                                    const isUserOpt = (oi === q.userAnswer);
                                    let optStyle: any = styles.optText;
                                    if (isCorrectOpt) optStyle = [styles.optText, styles.correctOpt];
                                    else if (isUserOpt) optStyle = [styles.optText, styles.wrongOpt];

                                    return (
                                        <View key={oi} style={styles.optContainer}>
                                            <Text style={styles.optNum}>{String.fromCharCode(65 + oi)}.</Text>
                                            <Text style={optStyle}>{opt} {isUserOpt && !isCorrectOpt ? '(Your Answer)' : ''}</Text>
                                        </View>
                                    );
                                })}

                                <View style={styles.explanation}>
                                    <Text style={styles.expTitle}>Explanation</Text>
                                    <Text>{q.explanation}</Text>
                                </View>
                            </View>
                        );
                    })}
                </View>
            </Page>
        </Document>
    );
}
