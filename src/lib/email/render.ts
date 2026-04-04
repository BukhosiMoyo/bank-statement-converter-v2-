import { getSiteUrl } from "@/lib/site-url";

export type RenderedEmail = {
  subject: string;
  previewText: string;
  html: string;
  text: string;
};

export type EmailAction = {
  label: string;
  href: string;
};

export type EmailDetail = {
  label: string;
  value: string;
};

type EmailSection = {
  title?: string;
  body?: string[];
  details?: EmailDetail[];
};

type EmailLayoutOptions = {
  previewText: string;
  eyebrow?: string;
  title: string;
  intro: string;
  sections?: EmailSection[];
  primaryAction?: EmailAction;
  secondaryAction?: EmailAction;
  footnote?: string;
};

const BRAND_NAME = "Bank Statement Converter";
const BRAND_MARK = "BS";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function absoluteUrl(value: string) {
  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }

  const path = value.startsWith("/") ? value : `/${value}`;
  return `${getSiteUrl()}${path}`;
}

function renderAction(action: EmailAction, variant: "primary" | "secondary") {
  const href = absoluteUrl(action.href);
  const background = variant === "primary" ? "#166a5b" : "#fffdf8";
  const textColor = variant === "primary" ? "#ffffff" : "#17202b";
  const border = variant === "primary" ? "#166a5b" : "rgba(23, 32, 43, 0.1)";

  return `
    <a
      href="${escapeHtml(href)}"
      style="
        display: inline-block;
        min-width: 164px;
        border-radius: 999px;
        border: 1px solid ${border};
        background: ${background};
        color: ${textColor};
        font-size: 14px;
        font-weight: 600;
        line-height: 1;
        padding: 14px 22px;
        text-align: center;
        text-decoration: none;
      "
    >
      ${escapeHtml(action.label)}
    </a>
  `.trim();
}

function renderDetails(details: EmailDetail[]) {
  return `
    <table
      role="presentation"
      width="100%"
      cellspacing="0"
      cellpadding="0"
      style="
        border-collapse: separate;
        border-spacing: 0;
        margin-top: 16px;
      "
    >
      ${details
        .map(
          (detail) => `
            <tr>
              <td
                style="
                  width: 38%;
                  border-top: 1px solid rgba(23, 32, 43, 0.08);
                  color: #5f6c76;
                  font-size: 12px;
                  letter-spacing: 0.14em;
                  padding: 12px 0;
                  text-transform: uppercase;
                  vertical-align: top;
                "
              >
                ${escapeHtml(detail.label)}
              </td>
              <td
                style="
                  border-top: 1px solid rgba(23, 32, 43, 0.08);
                  color: #17202b;
                  font-size: 14px;
                  font-weight: 600;
                  line-height: 1.55;
                  padding: 12px 0 12px 16px;
                  vertical-align: top;
                "
              >
                ${escapeHtml(detail.value)}
              </td>
            </tr>
          `,
        )
        .join("")}
    </table>
  `.trim();
}

function renderSection(section: EmailSection) {
  const title = section.title
    ? `
        <p
          style="
            color: #17202b;
            font-size: 16px;
            font-weight: 600;
            line-height: 1.4;
            margin: 0 0 12px;
          "
        >
          ${escapeHtml(section.title)}
        </p>
      `
    : "";

  const body = section.body?.length
    ? section.body
        .map(
          (paragraph) => `
            <p
              style="
                color: #5f6c76;
                font-size: 14px;
                line-height: 1.75;
                margin: 0 0 12px;
              "
            >
              ${escapeHtml(paragraph)}
            </p>
          `,
        )
        .join("")
    : "";

  const details = section.details?.length ? renderDetails(section.details) : "";

  return `
    <div
      style="
        border: 1px solid rgba(23, 32, 43, 0.08);
        border-radius: 24px;
        margin-top: 16px;
        padding: 24px;
      "
    >
      ${title}
      ${body}
      ${details}
    </div>
  `.trim();
}

function renderTextAction(label: string, href: string) {
  return `${label}: ${absoluteUrl(href)}`;
}

export function renderAppEmail(options: EmailLayoutOptions): Omit<RenderedEmail, "subject"> {
  const sections = options.sections ?? [];
  const actionMarkup = [options.primaryAction, options.secondaryAction]
    .filter((action): action is EmailAction => Boolean(action))
    .map((action, index) =>
      renderAction(action, index === 0 ? "primary" : "secondary"),
    )
    .join(
      '<span style="display: inline-block; width: 12px; max-width: 12px;">&nbsp;</span>',
    );

  const html = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta content="width=device-width, initial-scale=1.0" name="viewport" />
        <title>${escapeHtml(options.title)}</title>
      </head>
      <body
        style="
          background: #f7efe3;
          color: #17202b;
          font-family: Arial, Helvetica, sans-serif;
          margin: 0;
          padding: 24px 12px;
        "
      >
        <div
          style="
            color: transparent;
            display: none;
            font-size: 1px;
            line-height: 1px;
            max-height: 0;
            max-width: 0;
            opacity: 0;
            overflow: hidden;
          "
        >
          ${escapeHtml(options.previewText)}
        </div>

        <table
          role="presentation"
          width="100%"
          cellspacing="0"
          cellpadding="0"
          style="border-collapse: collapse; margin: 0 auto; max-width: 620px;"
        >
          <tr>
            <td>
              <div
                style="
                  border-radius: 32px;
                  background:
                    radial-gradient(circle at top left, rgba(26, 132, 110, 0.18), transparent 34%),
                    radial-gradient(circle at top right, rgba(205, 165, 104, 0.24), transparent 36%),
                    #fffaf3;
                  border: 1px solid rgba(23, 32, 43, 0.08);
                  box-shadow: 0 20px 60px rgba(23, 32, 43, 0.08);
                  overflow: hidden;
                "
              >
                <div style="padding: 28px 28px 0;">
                  <div
                    style="
                      align-items: center;
                      color: #17202b;
                      display: inline-flex;
                      font-size: 12px;
                      font-weight: 700;
                      gap: 12px;
                      letter-spacing: 0.16em;
                      text-transform: uppercase;
                    "
                  >
                    <span
                      style="
                        align-items: center;
                        background: linear-gradient(145deg, #1b7a66, #0f5145);
                        border: 1px solid rgba(0, 0, 0, 0.08);
                        border-radius: 18px;
                        color: #ffffff;
                        display: inline-flex;
                        height: 44px;
                        justify-content: center;
                        width: 44px;
                      "
                    >
                      ${BRAND_MARK}
                    </span>
                    <span>${BRAND_NAME}</span>
                  </div>
                </div>

                <div style="padding: 24px 28px 32px;">
                  ${
                    options.eyebrow
                      ? `
                        <p
                          style="
                            color: #5f6c76;
                            font-size: 12px;
                            font-weight: 600;
                            letter-spacing: 0.16em;
                            margin: 0 0 16px;
                            text-transform: uppercase;
                          "
                        >
                          ${escapeHtml(options.eyebrow)}
                        </p>
                      `
                      : ""
                  }
                  <h1
                    style="
                      color: #17202b;
                      font-size: 32px;
                      line-height: 1.08;
                      margin: 0;
                    "
                  >
                    ${escapeHtml(options.title)}
                  </h1>
                  <p
                    style="
                      color: #5f6c76;
                      font-size: 15px;
                      line-height: 1.8;
                      margin: 18px 0 0;
                    "
                  >
                    ${escapeHtml(options.intro)}
                  </p>
                  ${sections.map(renderSection).join("")}
                  ${
                    actionMarkup
                      ? `
                        <div style="margin-top: 24px;">
                          ${actionMarkup}
                        </div>
                      `
                      : ""
                  }
                  ${
                    options.footnote
                      ? `
                        <p
                          style="
                            color: #5f6c76;
                            font-size: 12px;
                            line-height: 1.7;
                            margin: 18px 0 0;
                          "
                        >
                          ${escapeHtml(options.footnote)}
                        </p>
                      `
                      : ""
                  }
                </div>
              </div>

              <p
                style="
                  color: #5f6c76;
                  font-size: 12px;
                  line-height: 1.7;
                  margin: 16px 12px 0;
                  text-align: center;
                "
              >
                ${BRAND_NAME}
              </p>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `.trim();

  const textParts = [
    BRAND_NAME,
    options.eyebrow ? options.eyebrow.toUpperCase() : null,
    options.title,
    "",
    options.intro,
    ...sections.flatMap((section) => [
      "",
      section.title ?? null,
      ...(section.body ?? []),
      ...(section.details ?? []).map((detail) => `${detail.label}: ${detail.value}`),
    ]),
    options.primaryAction
      ? renderTextAction(options.primaryAction.label, options.primaryAction.href)
      : null,
    options.secondaryAction
      ? renderTextAction(
          options.secondaryAction.label,
          options.secondaryAction.href,
        )
      : null,
    options.footnote ? "" : null,
    options.footnote ?? null,
  ]
    .filter((part): part is string => Boolean(part))
    .join("\n");

  return {
    previewText: options.previewText,
    html,
    text: textParts,
  };
}
