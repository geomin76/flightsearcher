codes = []

with open('data.txt') as fp:
   line = fp.readline()
   while line:
       codeArr = line.split(",")
       codes.append(codeArr[13])
       line = fp.readline()

with open('airports.txt') as fp:
    line = fp.readline()
    while line:
        codeArr = line.split(",")
        if codeArr[4].replace('"', "") in codes:
            string = ""
            string += codeArr[1].replace('"', "")
            string += "," + codeArr[2].replace('"', "")
            string += "," + codeArr[3].replace('"', "")
            string += "," + codeArr[4].replace('"', "")
            string += "," + codeArr[6]
            string += "," + codeArr[7]
            print(string)
        line = fp.readline()

