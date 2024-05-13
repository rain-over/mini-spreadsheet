# mini-spreadsheet

## A vanilla JS mini spreadsheet with basic functionalities

#### 1. Plain HTML, JavaScript, no Libraries or Frameworks.

#### 2. 100x100 cells with excel like cell address.

|     | A   | B   | C   | ... | CT  | CU  | CV    |
| --- | --- | --- | --- | --- | --- | --- | ----- |
| 1   | A1  |     |     |     |     |     |       |
| 2   |     |     |     |     |     |     |       |
| 3   |     |     |     |     |     |     |       |
| ... |     |     |     |     |     |     |       |
| 98  |     |     |     |     |     |     |       |
| 99  |     |     |     |     |     |     |       |
| 100 |     |     |     |     |     |     | CV100 |

#### 3. Editable Cells - data stored on JS Object, no persistent data.

#### 4. Has a Refresh Button to redraw spreadsheet with existing data - does not reload page.

#### 5. Has support and behavior of basic spreadsheet formula.

    =A1+A2

#### 6. Has support and behavior of basic functions.

    =sum(A1:A2)

#### 7. Has support for text formatting. for example bold, italics and underline \

ex: **Bold**, _Italic_ and <u>Underline</u>
