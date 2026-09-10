import { parseSections } from '@/utils/interpretation'

/** 首頁與歷史紀錄共用的解讀正文。 */
export default function InterpretationContent({
  text,
  streaming = false,
}: {
  text: string
  streaming?: boolean
}) {
  return (
    <div className={streaming ? 'streaming-caret' : undefined} aria-busy={streaming}>
      {parseSections(text).map((section, index) => (
        <section
          key={`${index}-${section.title ?? 'preamble'}`}
          className={index > 0 ? 'mt-6' : undefined}
        >
          {section.title && (
            <h3 className="font-display mb-2 flex items-center gap-2 text-base text-primary">
              <span aria-hidden="true" className="h-4 w-[3px] rounded-full bg-primary" />
              {section.title}
            </h3>
          )}
          <p className="whitespace-pre-wrap text-[15px] leading-7 text-body">
            {section.body}
          </p>
        </section>
      ))}
    </div>
  )
}
