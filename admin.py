import streamlit as st
import pandas as pd
from PyPDF2 import PdfReader
from langchain_core.prompts import PromptTemplate
from langchain_openai import ChatOpenAI
from dotenv import load_dotenv

load_dotenv()

def preProcessData(data):
    prompt = f"""Extract and organize the data from the uploaded document (Excel or PDF) into a well-structured format. The output should include the following:

                1. Package Names: List all the names of the packages or categories mentioned in the document.
                
                2. Pricing:
                    - Extract all price-related information, including standard pricing, discounted pricing, and renewal costs if available.
                    - Highlight any introductory offers or special terms for pricing.
                
                3. Features/Inclusions:
                    - List all included features for each package (e.g., WiFi, meeting room access, parking spaces, discounts).
                    - Specify feature usage limits (e.g., "5 hours/month of meeting room usage").
                
                4. Additional Services:
                    - Extract details of any optional or add-on services, along with their associated costs.
                
                5. Conditions/Notes:
                    - Summarize any additional notes, terms, or conditions mentioned in the document.
                
                6. Structure:
                    - Output the information in a clear and readable format.
                    - Ensure the data is aligned correctly with the associated categories. Retain any numerical values, units, or other specifications (e.g., hours, AED, percentages). If any information appears incomplete or ambiguous, note this explicitly."
                
                Data :- {data}
                """
    template = PromptTemplate(template=prompt, input_variables=["data"])

    model = ChatOpenAI(temperature=0.3, model='gpt-4o-mini')

    chain = template | model

    results = chain.invoke(input={"data": data})

    print(results.content)

    return results.content

def process_excel(file):
    """Function to process and display Excel file content."""
    try:
        df = pd.read_excel(file)
        st.write("Excel File Content:")
        st.dataframe(df)
    except Exception as e:
        st.error(f"An error occurred while processing the Excel file: {e}")

def process_pdf(file):
    """Function to process and display PDF file content."""
    try:
        pdf_reader = PdfReader(file)
        text_content = ""
        for page in pdf_reader.pages:
            text_content += page.extract_text()
        st.write("PDF File Content:")
        
        # Pre-process the extracted text with OpenAI
        extracted_data = preProcessData(text_content)
        
        # Display the result in the Streamlit app
        st.text_area("Extracted and Processed Data", value=extracted_data, height=300)
    except Exception as e:
        st.error(f"An error occurred while processing the PDF file: {e}")


# Streamlit UI
st.title("Admin Panel for Uploading PDF and Excel Files")
st.sidebar.header("Upload Section")
uploaded_file = st.sidebar.file_uploader("Upload a file (PDF or Excel)", type=["pdf", "xlsx"])

if uploaded_file is not None:
    file_type = uploaded_file.name.split('.')[-1].lower()
    
    st.sidebar.success(f"Uploaded {uploaded_file.name}")

    if file_type == "xlsx":
        process_excel(uploaded_file)
    elif file_type == "pdf":
        process_pdf(uploaded_file)
    else:
        st.error("Unsupported file type. Please upload a PDF or Excel file.")
else:
    st.sidebar.info("No file uploaded yet.")
