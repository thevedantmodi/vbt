import sys

import qrcode


def main():
    if len(sys.argv) < 1:
        print("TOO FEW ARGUMENTS")
    data = sys.argv[1]

    qr = qrcode.QRCode(version=1, box_size=1, border=4)
    qr.add_data(data)
    qr.make(fit=True)

    qr.print_ascii(invert=True)


if __name__ == "__main__":
    main()
