import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

type MonthlyReportData = {
  month: string;
  stats: {
    totalIncome: number;
    totalExpenses: number;
    net?: number;
    savingsRate?: number;
    byCategory?: Record<string, number>;
  };
  topCategories?: { name: string; amount: number; percentage: number }[];
  biggestTransaction?: {
    description: string | null;
    amount: number;
    category: string;
    date: Date;
  } | null;
  insights?: string[];
};

type BudgetAlertData = {
  percentageUsed: number;
  budgetAmount: number;
  totalExpenses: number;
  accountName: string;
  dashboardUrl?: string;
};

type EmailTemplateProps =
  | {
      userName: string;
      type: "monthly-report";
      data: MonthlyReportData;
    }
  | {
      userName: string;
      type: "budget-alert";
      data: BudgetAlertData;
    };

export default function EmailTemplate(props: EmailTemplateProps) {
  const { userName, type, data } = props;

  if (type === "monthly-report") {
    const report = data as MonthlyReportData;
    const net =
      report.stats.net ?? report.stats.totalIncome - report.stats.totalExpenses;
    const savingsRate =
      report.stats.savingsRate ??
      (report.stats.totalIncome > 0
        ? ((report.stats.totalIncome - report.stats.totalExpenses) /
            report.stats.totalIncome) *
          100
        : 0);

    return (
      <Html>
        <Head />
        <Preview>Your {report.month} Financial Report</Preview>
        <Body style={styles.body}>
          <Container style={styles.container}>
            <Heading style={styles.title}>
              Spendly - {report.month} Report
            </Heading>

            <Text style={styles.text}>Hello {userName},</Text>
            <Text style={styles.text}>
              Here is your financial summary for {report.month}:
            </Text>

            {/* Stats Grid */}
            <Section style={styles.statsContainer}>
              <div style={styles.stat}>
                <Text style={styles.statLabel}>Income</Text>
                <Text style={{ ...styles.heading, color: "#22c55e" }}>
                  Rs.{report.stats.totalIncome.toLocaleString()}
                </Text>
              </div>
              <div style={styles.stat}>
                <Text style={styles.statLabel}>Expenses</Text>
                <Text style={{ ...styles.heading, color: "#ef4444" }}>
                  Rs.{report.stats.totalExpenses.toLocaleString()}
                </Text>
              </div>
              <div style={styles.stat}>
                <Text style={styles.statLabel}>Net</Text>
                <Text
                  style={{
                    ...styles.heading,
                    color: net >= 0 ? "#22c55e" : "#ef4444",
                  }}
                >
                  {net >= 0 ? "+" : ""}Rs.{net.toLocaleString()}
                </Text>
              </div>
              <div style={styles.stat}>
                <Text style={styles.statLabel}>Savings Rate</Text>
                <Text
                  style={{
                    ...styles.heading,
                    color: savingsRate >= 20 ? "#22c55e" : "#64748b",
                  }}
                >
                  {savingsRate.toFixed(0)}%
                </Text>
              </div>
            </Section>

            {/* Top Categories */}
            {report.topCategories && report.topCategories.length > 0 && (
              <Section style={styles.section}>
                <Heading style={styles.heading}>
                  Top Spending Categories
                </Heading>
                {report.topCategories.map((category, index) => (
                  <div key={index} style={styles.categoryRow}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "8px",
                      }}
                    >
                      <Text
                        style={{ ...styles.text, margin: 0, fontWeight: 500 }}
                      >
                        {category.name}
                      </Text>
                      <Text style={{ ...styles.text, margin: 0 }}>
                        Rs.{category.amount.toLocaleString()} (
                        {category.percentage.toFixed(0)}%)
                      </Text>
                    </div>
                    <div style={styles.progressBar}>
                      <div
                        style={{
                          height: "8px",
                          width: `${Math.min(category.percentage, 100)}%`,
                          backgroundColor: "#10b981",
                          borderRadius: "4px",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </Section>
            )}

            {/* Biggest Transaction */}
            {report.biggestTransaction && (
              <Section style={styles.section}>
                <Heading style={styles.heading}>Biggest Expense</Heading>
                <div style={styles.highlightBox}>
                  <Text
                    style={{
                      ...styles.text,
                      fontWeight: 600,
                      margin: "0 0 8px 0",
                    }}
                  >
                    {report.biggestTransaction.description ||
                      "Unnamed transaction"}
                  </Text>
                  <Text
                    style={{
                      ...styles.heading,
                      color: "#ef4444",
                      margin: "0 0 8px 0",
                    }}
                  >
                    Rs.{report.biggestTransaction.amount.toLocaleString()}
                  </Text>
                  <Text
                    style={{
                      ...styles.text,
                      fontSize: "14px",
                      color: "#6b7280",
                      margin: 0,
                    }}
                  >
                    {report.biggestTransaction.category} -{" "}
                    {new Date(
                      report.biggestTransaction.date,
                    ).toLocaleDateString()}
                  </Text>
                </div>
              </Section>
            )}

            {/* Insights */}
            {report.insights && report.insights.length > 0 && (
              <Section style={styles.section}>
                <Heading style={styles.heading}>Insights</Heading>
                {report.insights.map((insight, index) => (
                  <Text
                    key={index}
                    style={{
                      ...styles.text,
                      paddingLeft: "12px",
                      borderLeft: "3px solid #10b981",
                    }}
                  >
                    {insight}
                  </Text>
                ))}
              </Section>
            )}

            {/* Legacy byCategory support */}
            {report.stats.byCategory && !report.topCategories && (
              <Section style={styles.section}>
                <Heading style={styles.heading}>Expenses by Category</Heading>
                {Object.entries(report.stats.byCategory).map(
                  ([category, amount]) => (
                    <div key={category} style={styles.row}>
                      <Text style={styles.text}>{category}</Text>
                      <Text style={styles.text}>Rs.{amount}</Text>
                    </div>
                  ),
                )}
              </Section>
            )}

            {/* CTA Button */}
            <Section style={{ textAlign: "center", marginTop: "24px" }}>
              <Button
                href="https://spendly.vercel.app/dashboard"
                style={styles.button}
              >
                View Dashboard
              </Button>
            </Section>

            <Text style={styles.footer}>
              Manage your finances at <strong>spendly.vercel.app</strong>
            </Text>
          </Container>
        </Body>
      </Html>
    );
  }

  if (type === "budget-alert") {
    const alert = data as BudgetAlertData;
    return (
      <Html>
        <Head />
        <Preview>Budget Alert</Preview>
        <Body style={styles.body}>
          <Container style={styles.container}>
            <Heading style={styles.title}>Budget Alert</Heading>
            <Text style={styles.text}>Hello {userName},</Text>
            <Text style={styles.text}>
              You have used {alert.percentageUsed.toFixed(1)}% of your monthly
              budget for <strong>{alert.accountName}</strong>.
            </Text>

            <Section style={styles.statsContainer}>
              <div style={styles.stat}>
                <Text style={styles.statLabel}>Budget Amount</Text>
                <Text style={styles.heading}>Rs.{alert.budgetAmount}</Text>
              </div>
              <div style={styles.stat}>
                <Text style={styles.statLabel}>Spent So Far</Text>
                <Text style={styles.heading}>Rs.{alert.totalExpenses}</Text>
              </div>
              <div style={styles.stat}>
                <Text style={styles.statLabel}>Remaining</Text>
                <Text style={styles.heading}>
                  Rs.{(alert.budgetAmount - alert.totalExpenses).toFixed(2)}
                </Text>
              </div>
            </Section>

            {alert.dashboardUrl && (
              <Section style={{ textAlign: "center", marginTop: "20px" }}>
                <Button href={alert.dashboardUrl} style={styles.button}>
                  View Budget Dashboard
                </Button>
              </Section>
            )}

            <Text style={styles.footer}>
              Keep an eye on your spending to stay within your budget!
            </Text>
          </Container>
        </Body>
      </Html>
    );
  }

  return (
    <Html>
      <Head />
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Heading style={styles.title}>Spendly</Heading>
          <Text style={styles.text}>
            This message could not be rendered. Please try again.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const styles = {
  body: {
    backgroundColor: "#f6f9fc",
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  container: {
    backgroundColor: "#ffffff",
    margin: "0 auto",
    padding: "20px",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    maxWidth: "600px",
  },
  title: {
    color: "#1f2937",
    fontSize: "28px",
    fontWeight: "bold" as const,
    textAlign: "center" as const,
    margin: "0 0 20px",
  },
  heading: {
    color: "#1f2937",
    fontSize: "20px",
    fontWeight: 600,
    margin: "0 0 16px",
  },
  text: {
    color: "#4b5563",
    fontSize: "16px",
    margin: "0 0 16px",
  },
  statLabel: {
    color: "#6b7280",
    fontSize: "12px",
    textTransform: "uppercase" as const,
    letterSpacing: "0.05em",
    margin: "0 0 4px",
  },
  button: {
    backgroundColor: "#10b981",
    color: "#ffffff",
    fontSize: "16px",
    padding: "12px 24px",
    borderRadius: "8px",
    textDecoration: "none",
    display: "inline-block",
    fontWeight: 500,
  },
  section: {
    marginTop: "32px",
    padding: "20px",
    backgroundColor: "#f9fafb",
    borderRadius: "8px",
    border: "1px solid #e5e7eb",
  },
  statsContainer: {
    margin: "32px 0",
    padding: "20px",
    backgroundColor: "#f9fafb",
    borderRadius: "8px",
  },
  stat: {
    marginBottom: "16px",
    padding: "12px",
    backgroundColor: "#fff",
    borderRadius: "6px",
    boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
  },
  row: {
    display: "flex" as const,
    justifyContent: "space-between" as const,
    padding: "12px 0",
    borderBottom: "1px solid #e5e7eb",
  },
  categoryRow: {
    marginBottom: "16px",
    padding: "12px",
    backgroundColor: "#fff",
    borderRadius: "6px",
  },
  progressBar: {
    height: "8px",
    backgroundColor: "#e5e7eb",
    borderRadius: "4px",
    overflow: "hidden" as const,
  },
  highlightBox: {
    padding: "16px",
    backgroundColor: "#fef2f2",
    borderRadius: "8px",
    border: "1px solid #fecaca",
  },
  footer: {
    color: "#6b7280",
    fontSize: "14px",
    textAlign: "center" as const,
    marginTop: "32px",
    paddingTop: "16px",
    borderTop: "1px solid #e5e7eb",
  },
};
