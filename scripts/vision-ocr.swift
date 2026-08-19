import AppKit
import Foundation
import Vision

var arguments = Array(CommandLine.arguments.dropFirst())
var outputHandle = FileHandle.standardOutput
if let outputIndex = arguments.firstIndex(of: "--output"), outputIndex + 1 < arguments.count {
    let outputPath = arguments[outputIndex + 1]
    FileManager.default.createFile(atPath: outputPath, contents: nil)
    outputHandle = FileHandle(forWritingAtPath: outputPath) ?? .standardOutput
    arguments.removeSubrange(outputIndex...(outputIndex + 1))
}

guard !arguments.isEmpty else {
    fputs("Usage: vision-ocr [--output path] <image> [image ...]\n", stderr)
    exit(2)
}

func writeLine(_ value: String) {
    outputHandle.write(Data("\(value)\n".utf8))
}

for path in arguments {
    let url = URL(fileURLWithPath: path)
    guard let image = NSImage(contentsOf: url),
          let data = image.tiffRepresentation,
          let bitmap = NSBitmapImageRep(data: data),
          let cgImage = bitmap.cgImage else {
        fputs("Could not load image: \(path)\n", stderr)
        continue
    }

    let request = VNRecognizeTextRequest()
    request.recognitionLevel = .accurate
    request.recognitionLanguages = ["zh-Hans", "zh-Hant", "en-US"]
    request.usesLanguageCorrection = true

    do {
        try VNImageRequestHandler(cgImage: cgImage).perform([request])
        writeLine("\u{001E}\(path)")
        for observation in request.results ?? [] {
            if let text = observation.topCandidates(1).first?.string {
                writeLine(text)
            }
        }
    } catch {
        fputs("OCR failed for \(path): \(error)\n", stderr)
    }
}

if outputHandle !== FileHandle.standardOutput {
    try? outputHandle.close()
}
