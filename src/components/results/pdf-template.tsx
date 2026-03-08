import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

// Register standard fonts
Font.register({
    family: 'Open Sans',
    src: 'https://fonts.gstatic.com/s/opensans/v18/mem8YaGs126MiZpBA-UFVZ0e.ttf',
});

const styles = StyleSheet.create({
    page: { padding: 50, fontFamily: 'Open Sans', fontSize: 10, color: '#334155', lineHeight: 1.5 },
    header: { marginBottom: 25, borderBottom: '2px solid #0f172a', paddingBottom: 15 },
    title: { fontSize: 22, fontWeight: 'bold', color: '#0f172a' },
    subtitle: { fontSize: 11, color: '#64748b', marginTop: 4 },

    section: { marginTop: 20, marginBottom: 10 },
    sectionTitle: { fontSize: 14, fontWeight: 'bold', borderBottom: '1px solid #e2e8f0', paddingBottom: 6, marginBottom: 12, color: '#0f172a', textTransform: 'uppercase', letterSpacing: 1 },

    grid: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 20 },
    gridItem: { width: '50%', marginBottom: 8 },
    label: { fontWeight: 'bold', fontSize: 9, color: '#64748b', textTransform: 'uppercase' },
    value: { fontSize: 11, color: '#0f172a', marginTop: 2 },

    scoreBox: { backgroundColor: '#f8fafc', padding: 20, borderRadius: 8, marginTop: 10, flexDirection: 'row', justifyContent: 'space-between', border: '1px solid #e2e8f0' },
    scoreItem: { alignItems: 'center', flex: 1 },
    scoreLabel: { fontSize: 10, color: '#64748b', marginBottom: 5 },
    scoreValue: { fontSize: 18, fontWeight: 'bold', color: '#0f172a' },
    xpValue: { color: '#f59e0b' },

    qContainer: { marginBottom: 20, padding: 15, borderRadius: 8, border: '1px solid #f1f5f9', backgroundColor: '#ffffff' },
    qHeader: { flexDirection: 'row', marginBottom: 10 },
    qNum: { width: 30, fontWeight: 'bold', color: '#64748b' },
    qText: { flex: 1, fontWeight: 'bold', fontSize: 11, lineHeight: 1.4 },
    qStatus: { marginLeft: 10, padding: '2 6', borderRadius: 4, fontSize: 8, fontWeight: 'bold', textTransform: 'uppercase' },

    statusCORRECT: { backgroundColor: '#dcfce7', color: '#166534' },
    statusWRONG: { backgroundColor: '#fee2e2', color: '#991b1b' },
    statusSKIPPED: { backgroundColor: '#f1f5f9', color: '#475569' },

    optList: { marginTop: 5 },
    optContainer: { flexDirection: 'row', marginBottom: 4, padding: '4 8', borderRadius: 4 },
    optNum: { width: 20, fontWeight: 'bold', fontSize: 9 },
    optText: { flex: 1, fontSize: 10 },

    optCorrect: { backgroundColor: '#f0fdf4', border: '1px solid #bdf4c9' },
    optWrong: { backgroundColor: '#fff1f2', border: '1px solid #fecaca' },

    explanation: { backgroundColor: '#f8fafc', padding: 12, marginTop: 10, borderRadius: 6, borderLeft: '3px solid #14b8a6' },
    expTitle: { fontSize: 9, fontWeight: 'bold', color: '#14b8a6', marginBottom: 4, textTransform: 'uppercase' },
    expText: { fontSize: 9, color: '#475569', lineHeight: 1.4 },

    footer: { position: 'absolute', bottom: 30, left: 40, right: 40, borderTop: '1px solid #e2e8f0', paddingTop: 10, flexDirection: 'row', justifyContent: 'space-between', color: '#94a3b8', fontSize: 8 }
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
                <View style={styles.header}>
                    <Text style={styles.title}>Official HAT Practice Report</Text>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
                        <View>
                            <Text style={styles.subtitle}>Candidate: {user.name || user.email}</Text>
                            <Text style={styles.subtitle}>Email: {user.email}</Text>
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
                            <Text style={styles.subtitle}>Date: {new Date(attempt.createdAt).toLocaleDateString()}</Text>
                            <Text style={styles.subtitle}>ID: {attempt.id.slice(0, 8)}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Performance Summary</Text>
                    <View style={styles.grid}>
                        <View style={styles.gridItem}>
                            <Text style={styles.label}>Category</Text>
                            <Text style={styles.value}>{attempt.category.replace('_', ' ')}</Text>
                        </View>
                        <View style={styles.gridItem}>
                            <Text style={styles.label}>Exam Mode</Text>
                            <Text style={styles.value}>{attempt.mode}</Text>
                        </View>
                        <View style={styles.gridItem}>
                            <Text style={styles.label}>Difficulty</Text>
                            <Text style={styles.value}>{attempt.difficulty}</Text>
                        </View>
                        <View style={styles.gridItem}>
                            <Text style={styles.label}>Time Spent</Text>
                            <Text style={styles.value}>{timeStr}</Text>
                        </View>
                    </View>

                    <View style={styles.scoreBox}>
                        <View style={styles.scoreItem}>
                            <Text style={styles.scoreLabel}>Final Score</Text>
                            <Text style={styles.scoreValue}>{attempt.score} / {attempt.maxScore}</Text>
                        </View>
                        <View style={styles.scoreItem}>
                            <Text style={styles.scoreLabel}>Accuracy</Text>
                            <Text style={styles.scoreValue}>{pct}%</Text>
                        </View>
                        <View style={styles.scoreItem}>
                            <Text style={styles.scoreLabel}>XP Awarded</Text>
                            <Text style={[styles.scoreValue, styles.xpValue]}>+{attempt.xpEarned || 0}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Detailed Review</Text>
                    {rs.map((q: any, i: number) => {
                        const isCorrect = q.userAnswer === q.correctAnswer;
                        const isSkipped = q.userAnswer === null;
                        const statusKey = isCorrect ? 'statusCORRECT' : isSkipped ? 'statusSKIPPED' : 'statusWRONG';

                        return (
                            <View key={i} style={styles.qContainer} wrap={false}>
                                <View style={styles.qHeader}>
                                    <Text style={styles.qNum}>{i + 1}.</Text>
                                    <Text style={styles.qText}>{q.questionText}</Text>
                                    <View>
                                        <Text style={[styles.qStatus, (styles as any)[statusKey]]}>
                                            {isSkipped ? 'SKIPPED' : isCorrect ? 'CORRECT' : 'WRONG'}
                                        </Text>
                                    </View>
                                </View>

                                <View style={styles.optList}>
                                    {q.options.map((opt: string, oi: number) => {
                                        const isCorrectOpt = (oi === q.correctAnswer);
                                        const isUserOpt = (oi === q.userAnswer);

                                        return (
                                            <View
                                                key={oi}
                                                style={[
                                                    styles.optContainer,
                                                    isCorrectOpt ? styles.optCorrect : (isUserOpt ? styles.optWrong : {})
                                                ]}
                                            >
                                                <Text style={[styles.optNum, isCorrectOpt ? { color: '#166534' } : (isUserOpt ? { color: '#991b1b' } : { color: '#64748b' })]}>
                                                    {String.fromCharCode(65 + oi)}
                                                </Text>
                                                <Text style={[styles.optText, isCorrectOpt ? { color: '#166534', fontWeight: 'bold' } : (isUserOpt ? { color: '#991b1b' } : {})]}>
                                                    {opt} {isUserOpt && !isCorrectOpt ? '(Your Selection)' : ''}
                                                </Text>
                                            </View>
                                        );
                                    })}
                                </View>

                                <View style={styles.explanation}>
                                    <Text style={styles.expTitle}>Explanation</Text>
                                    <Text style={styles.expText}>{q.explanation}</Text>
                                </View>
                            </View>
                        );
                    })}
                </View>

                <View style={styles.footer} fixed>
                    <Text>HAT Simulator - Prep with Confidence</Text>
                    <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
                </View>
            </Page>
        </Document>
    );
}
